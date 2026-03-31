import { useState, useEffect } from 'react';
import { Save, Info, AlertCircle, RefreshCw } from 'lucide-react';

const emptyForm = { nome: '', categoriaId: '', unMedId: '', estoque: '', minimo: '', preco: '' };

const Field = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', letterSpacing: '0.03em' }}>{label}</label>
      {children}
    </div>
  );
  
export default function MaterialForm({ editando, onSave, onCancel, categorias, unidades, salvando, erroForm, setErroForm }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editando) {
      setForm({
        nome:        editando.nome,
        categoriaId: String(editando.categoriaId),
        unMedId:     String(editando.unMedId),
        estoque:     String(editando.estoqueAtual),
        minimo:      String(editando.estoqueMin),
        preco:       String(editando.preco),
      });
    } else {
      setForm(emptyForm);
    }
  }, [editando]);

  const set = (field, value) => { setForm(f => ({ ...f, [field]: value })); setErroForm?.(null); };

  // Indicador visual de estoque
  const estoqueNum = parseFloat(form.estoque) || 0;
  const minimoNum  = parseFloat(form.minimo)  || 0;
  const ratio      = minimoNum > 0 ? estoqueNum / minimoNum : 0;
  const barPct     = Math.min(100, Math.round(ratio * 100));
  const barColor   = ratio <= 0 ? 'var(--border)' : ratio <= 0.5 ? '#ef4444' : ratio < 1 ? '#f59e0b' : '#10b981';
  const nivelLabel = minimoNum === 0 ? '—' : ratio <= 0.5 ? 'Crítico' : ratio < 1 ? 'Baixo' : 'Normal';

  const inputStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '10px 14px', color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none',
    width: '100%', transition: 'all 0.2s',
  };
  const focusStyle = (e) => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-glow)'; };
  const blurStyle  = (e) => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };

  const handleSubmit = () => {
    if (!form.nome || !form.categoriaId || !form.unMedId || form.estoque === '' || form.minimo === '' || form.preco === '') {
      setErroForm?.('Preencha todos os campos obrigatórios.'); return;
    }
    onSave(form);
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', position: 'sticky', top: 0, animation: 'fadeUp 0.35s ease 0.05s both' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }}/>
          {editando ? 'Editar Material' : 'Novo Material'}
        </div>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>* obrigatórios</span>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {editando && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--accent)' }}>
            <Info size={14}/> Editando: <strong>{editando.nome}</strong>
          </div>
        )}

        {/* Nome */}
        <Field label="Nome do Material *">
          <input style={inputStyle} value={form.nome} placeholder="Ex: Papel A4 75g"
            onChange={e => set('nome', e.target.value)}
            onFocus={focusStyle} onBlur={blurStyle} disabled={salvando}/>
        </Field>

        {/* Categoria — select com dados da API */}
        <Field label="Categoria *">
          <select style={inputStyle} value={form.categoriaId}
            onChange={e => set('categoriaId', e.target.value)}
            onFocus={focusStyle} onBlur={blurStyle} disabled={salvando}>
            <option value="" disabled>Selecione a categoria...</option>
            {categorias.map(c => (
              <option key={c.idCategoria} value={c.idCategoria}>{c.nome}</option>
            ))}
          </select>
        </Field>

        {/* Estoque atual + mínimo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Estoque Atual *">
            <input style={inputStyle} type="number" min="0" value={form.estoque} placeholder="0"
              onChange={e => set('estoque', e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} disabled={salvando}/>
          </Field>
          <Field label="Estoque Mínimo *">
            <>
              <input style={inputStyle} type="number" min="0" value={form.minimo} placeholder="0"
                onChange={e => set('minimo', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle} disabled={salvando}/>
              <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Info size={10}/> Dispara alerta abaixo deste valor
              </div>
            </>
          </Field>
        </div>

        {/* Indicador visual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Nível:</span>
          <div style={{ flex: 1, height: 5, background: '#20253a', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ width: `${barPct}%`, height: '100%', background: barColor, borderRadius: 5, transition: 'all 0.3s' }}/>
          </div>
          <span style={{ fontSize: 11, color: barColor, whiteSpace: 'nowrap', minWidth: 40, textAlign: 'right' }}>{nivelLabel}</span>
        </div>

        {/* Unidade + Preço — selects da API */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Unidade de Medida *">
            <select style={inputStyle} value={form.unMedId}
              onChange={e => set('unMedId', e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} disabled={salvando}>
              <option value="" disabled>Selecione...</option>
              {unidades.map(u => (
                <option key={u.idUnMed} value={u.idUnMed}>{u.nome}</option>
              ))}
            </select>
          </Field>
          <Field label="Preço Unitário *">
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--muted)', pointerEvents: 'none' }}>R$</span>
              <input style={{ ...inputStyle, paddingLeft: 36 }} type="number" min="0" step="0.01"
                value={form.preco} placeholder="0,00"
                onChange={e => set('preco', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle} disabled={salvando}/>
            </div>
          </Field>
        </div>

        {/* Erro */}
        {erroForm && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ef4444' }}>
            <AlertCircle size={13}/> {erroForm}
          </div>
        )}

        <div style={{ height: 1, background: 'var(--border)' }}/>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setForm(emptyForm); onCancel?.(); }} disabled={salvando}
            style={{ flex: 1, padding: 10, borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', fontFamily: 'DM Sans', fontSize: 13, cursor: 'pointer' }}>
            Limpar
          </button>
          <button onClick={handleSubmit} disabled={salvando}
            style={{ flex: 2, padding: 10, borderRadius: 10, background: salvando ? 'var(--surface2)' : 'var(--accent)', border: 'none', color: salvando ? 'var(--muted)' : 'white', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, cursor: salvando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all 0.2s' }}>
            {salvando
              ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }}/> Salvando...</>
              : <><Save size={14}/>{editando ? 'Salvar Alterações' : 'Cadastrar'}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}