import { useState, useMemo, useCallback } from 'react';
import { Search, Receipt, CreditCard, QrCode, Banknote, XCircle, FileText, Printer, CalendarDays, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSales, cancelSale } from '@/lib/store';
import type { PaymentMethod, Sale } from '@/lib/store';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const paymentLabels: Record<PaymentMethod, string> = {
  credit: 'Crédito', debit: 'Débito', pix: 'Pix', cash: 'Dinheiro',
};
const paymentIcons: Record<PaymentMethod, typeof CreditCard> = {
  credit: CreditCard, debit: CreditCard, pix: QrCode, cash: Banknote,
};

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function printReceipt(sale: Sale) {
  const w = window.open('', '_blank', 'width=320,height=600');
  if (!w) return;
  const items = sale.items.map(i => `<tr><td>${i.quantity}× ${i.product.name}</td><td style="text-align:right">R$ ${(i.quantity * i.product.price).toFixed(2)}</td></tr>`).join('');
  w.document.write(`<!DOCTYPE html><html><head><title>Pedido #${sale.id.slice(0,8)}</title>
<style>
  @page { size: 80mm auto; margin: 0mm; }
  body { font-family: monospace; font-size: 12px; width: 80mm; padding: 5mm; color: #000; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 2px 0; }
</style></head><body>
  <div class="center bold" style="font-size:14px">RestoPDV</div>
  <div class="center" style="font-size:10px">${new Date(sale.date).toLocaleString('pt-BR')}</div>
  <hr/>
  <div class="bold">Pedido #${sale.id.slice(0,8)}</div>
  ${sale.customer.name ? `<div>Cliente: ${sale.customer.name}</div>` : ''}
  ${sale.customer.phone ? `<div>Tel: ${sale.customer.phone}</div>` : ''}
  ${sale.customer.street ? `<div>End: ${sale.customer.street}, ${sale.customer.number} - ${sale.customer.neighborhood}</div>` : ''}
  ${sale.customer.complement ? `<div>${sale.customer.complement}</div>` : ''}
  <hr/>
  <table>${items}</table>
  <hr/>
  <div class="bold" style="text-align:right;font-size:14px">TOTAL: R$ ${sale.total.toFixed(2)}</div>
  <div style="text-align:right">Pagamento: ${paymentLabels[sale.paymentMethod]}</div>
  ${sale.changeFor ? `<div style="text-align:right">Troco para: R$ ${sale.changeFor.toFixed(2)}</div>` : ''}
  ${sale.observations ? `<hr/><div style="font-size:10px">Obs: ${sale.observations}</div>` : ''}
  <hr/>
  <div class="center" style="font-size:10px;margin-top:8px">Obrigado pela preferência!</div>
</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

export default function History() {
  const [version, setVersion] = useState(0);
  const allSales = useMemo(() => getSales().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [version]);
  const [search, setSearch] = useState('');
  const [filterDay, setFilterDay] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');

  // Compute available years from sales data
  const availableYears = useMemo(() => {
    const years = new Set(allSales.map(s => new Date(s.date).getFullYear().toString()));
    return Array.from(years).sort().reverse();
  }, [allSales]);

  // Days for the selector (1-31)
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  const hasFilters = filterDay || filterMonth || filterYear;

  const clearFilters = () => {
    setFilterDay('');
    setFilterMonth('');
    setFilterYear('');
  };

  const filtered = useMemo(() => {
    let result = allSales;

    // Date filters
    if (filterDay || filterMonth || filterYear) {
      result = result.filter(s => {
        const d = new Date(s.date);
        if (filterDay && d.getDate() !== parseInt(filterDay)) return false;
        if (filterMonth && d.getMonth() !== parseInt(filterMonth)) return false;
        if (filterYear && d.getFullYear() !== parseInt(filterYear)) return false;
        return true;
      });
    }

    // Text search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.customer.name.toLowerCase().includes(q) ||
        new Date(s.date).toLocaleDateString('pt-BR').includes(q) ||
        s.id.slice(0, 8).includes(q)
      );
    }

    return result;
  }, [allSales, search, filterDay, filterMonth, filterYear]);

  const handleCancel = (id: string) => {
    cancelSale(id);
    setVersion(v => v + 1);
    toast({ title: '❌ Pedido cancelado!' });
  };

  const exportPDF = useCallback(() => {
    const activeSales = filtered.filter(s => !s.cancelled);
    if (activeSales.length === 0) {
      toast({ title: '⚠️ Nenhum pedido ativo para exportar.' });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(200, 60, 40);
    doc.text('RestoPDV - Relatório de Vendas', pageWidth / 2, 20, { align: 'center' });

    // Period description
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const parts: string[] = [];
    if (filterDay) parts.push(`Dia ${filterDay}`);
    if (filterMonth) parts.push(months[parseInt(filterMonth)]);
    if (filterYear) parts.push(filterYear);
    const periodText = parts.length > 0 ? `Período: ${parts.join(' / ')}` : 'Todos os pedidos';
    doc.text(periodText, pageWidth / 2, 28, { align: 'center' });

    // Table
    const tableData = activeSales.map(s => [
      new Date(s.date).toLocaleDateString('pt-BR'),
      `#${s.id.slice(0, 8)}`,
      s.customer.name || '—',
      s.items.map(i => `${i.quantity}× ${i.product.name}`).join(', '),
      paymentLabels[s.paymentMethod],
      `R$ ${s.total.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 34,
      head: [['Data', 'ID', 'Cliente', 'Itens', 'Pagamento', 'Total']],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [200, 60, 40], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 245, 240] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 22 },
        3: { cellWidth: 55 },
        5: { cellWidth: 25, halign: 'right' },
      },
    });

    // Footer summary
    const finalY = (doc as any).lastAutoTable?.finalY || 200;
    const totalGeral = activeSales.reduce((s, sale) => s + sale.total, 0);
    const byMethod: Record<PaymentMethod, number> = { credit: 0, debit: 0, pix: 0, cash: 0 };
    activeSales.forEach(s => { byMethod[s.paymentMethod] += s.total; });

    let footerY = finalY + 12;

    doc.setDrawColor(200, 60, 40);
    doc.line(14, footerY - 4, pageWidth - 14, footerY - 4);

    doc.setFontSize(12);
    doc.setTextColor(200, 60, 40);
    doc.text(`Total Geral: R$ ${totalGeral.toFixed(2)}`, pageWidth - 14, footerY + 2, { align: 'right' });

    footerY += 10;
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const methodSummary = (Object.keys(byMethod) as PaymentMethod[])
      .filter(m => byMethod[m] > 0)
      .map(m => `${paymentLabels[m]}: R$ ${byMethod[m].toFixed(2)}`)
      .join('   |   ');
    doc.text(methodSummary, pageWidth / 2, footerY, { align: 'center' });

    footerY += 8;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')} • ${activeSales.length} pedido(s)`, pageWidth / 2, footerY, { align: 'center' });

    doc.save(`relatorio-vendas-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast({ title: '📄 Relatório PDF exportado!' });
  }, [filtered, filterDay, filterMonth, filterYear]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
          <Receipt className="h-6 w-6 text-primary" />
          Histórico de Pedidos
        </h1>
        <Button onClick={exportPDF} className="gradient-primary text-primary-foreground gap-2">
          <FileText className="h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border shadow-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-card-foreground">Filtros de Data</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filterDay} onValueChange={setFilterDay}>
            <SelectTrigger className="w-[100px] h-9">
              <SelectValue placeholder="Dia" />
            </SelectTrigger>
            <SelectContent>
              {days.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-[100px] h-9">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.length > 0 ? availableYears.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              )) : (
                <SelectItem value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</SelectItem>
              )}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground gap-1">
              <X className="h-3 w-3" /> Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por cliente, data ou ID..." className="pl-10" />
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">{filtered.length} pedido(s) encontrado(s)</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(sale => {
            const Icon = paymentIcons[sale.paymentMethod];
            const isCancelled = sale.cancelled;
            return (
              <div key={sale.id} className={`bg-card rounded-xl border shadow-card p-4 ${isCancelled ? 'border-destructive/40 opacity-60' : 'border-border'}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">#{sale.id.slice(0, 8)}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(sale.date).toLocaleString('pt-BR')}
                      </span>
                      {isCancelled && (
                        <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">CANCELADO</span>
                      )}
                    </div>
                    {sale.customer.name && (
                      <p className="font-semibold text-card-foreground">{sale.customer.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {sale.items.map(i => `${i.quantity}× ${i.product.name}`).join(', ')}
                    </p>
                    {sale.observations && (
                      <p className="text-xs text-muted-foreground mt-1 italic">📝 {sale.observations}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                    <p className={`text-lg font-extrabold ${isCancelled ? 'text-muted-foreground line-through' : 'text-primary'}`}>R$ {sale.total.toFixed(2)}</p>
                    <div className="flex items-center gap-1 justify-end text-xs text-muted-foreground">
                      <Icon className="h-3 w-3" />
                      {paymentLabels[sale.paymentMethod]}
                    </div>
                    <div className="flex gap-1">
                      {!isCancelled && (
                        <>
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 h-7 text-xs" onClick={() => printReceipt(sale)}>
                            <Printer className="h-3 w-3 mr-1" /> Imprimir
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 text-xs" onClick={() => handleCancel(sale.id)}>
                            <XCircle className="h-3 w-3 mr-1" /> Cancelar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
