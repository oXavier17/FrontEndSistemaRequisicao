import { useState, useEffect } from 'react';
import { Save, Info, AlertCircle, RefreshCw } from 'lucide-react';
import BuscaDropdown from '../ui/BuscaDropdown';

// Enum de unidades — definido no back-end, espelhado aqui
const UNIDADES_ENUM = [
  { value: 'UN',    label: 'Unidade (un)'  },
  { value: 'CX',    label: 'Caixa (cx)'    },
  { value: 'KG',    label: 'Quilograma (kg)'},
  { value: 'L',     label: 'Litro (L)'     },
  { value: 'M',     label: 'Metro (m)'     },
  { value: 'RESMA', label: 'Resma'         },
  { value: 'PCT',   label: 'Pacote (pct)'  },
  { value: 'PAR',   label: 'Par'           },
];

const emptyForm = { nome: '', categoriaId: '', unidade: '', minimo: '' };

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', letterSpacing: '0.03em' }}>{label}</label>
    {children}
  </div>
);

export default function MaterialForm({ editando, onSave, onCancel, categorias, salvando, erroForm, setErroForm }) {
  const [form, setForm] = useState(emptyForm);
  const [categoriaSel, setCategoriaSel] = useState(null);

  useEffect(() => {
    if (editando) {
      const cat = categorias.find(c => c.idCategoria === editando.categoriaId)
      if (cat) setCategoriaSel({ id: cat.idCategoria, label: cat.nome });
      setForm({
        nome:        editando.nome,
        categoriaId: String(editando.categoriaId),
        unidade:     editando.unidade ?? '',
        minimo:      String(editando.estoqueMin),
      });
    } else {
      setCategoriaSel(null);
      setForm(emptyForm);
    }
  }, [editando]);

  useEffect(() => {
    // Se parou de salvar, não tem erro na tela e NÃO estamos editando, limpa o form
    if (!salvando && !erroForm && !editando) {
      setForm(emptyForm);
      setCategoriaSel(null);
    }
  }, [salvando, erroForm, editando]);

  const set = (field, value) => { setForm(f => ({ ...f, [field]: value })); setErroForm?.(null); };

  const inputStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '10px 14px', color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none',
    width: '100%', transition: 'all 0.2s',
  };
  const focusStyle = (e) => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-glow)'; };
  const blurStyle  = (e) => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };

  const handleSubmit = () => {
    if (!form.nome || !form.categoriaId || !form.unidade || form.minimo === '') {
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

        <Field label="Nome do Material *">
          <input style={inputStyle} value={form.nome} placeholder="Ex: Papel A4 75g"
            onChange={e => set('nome', e.target.value)}
            onFocus={focusStyle} onBlur={blurStyle} disabled={salvando}/>
        </Field>

        <Field label="Categoria *">
          <BuscaDropdown
            placeholder="Digite para buscar categoria..."
            itens={categorias.map(c => ({
              id:    c.idCategoria,
              label: c.nome,
            }))}
            selecionado={categoriaSel}
            onSelecionar={item => {
              setCategoriaSel(item);
              set('categoriaId', item.id);
            }}
            onLimpar={() => {
              setCategoriaSel(null);
              set('categoriaId', '');
            }}
          />
        </Field>

        {/* Unidade como enum — select fixo, sem cadastro */}
        <Field label="Unidade de Medida *">
          <select style={inputStyle} value={form.unidade}
            onChange={e => set('unidade', e.target.value)}
            onFocus={focusStyle} onBlur={blurStyle} disabled={salvando}>
            <option value="" disabled>Selecione a unidade...</option>
            {UNIDADES_ENUM.map(u => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Estoque Mínimo *">
          <input style={inputStyle} type="number" min="0" value={form.minimo} placeholder="0"
            onChange={e => set('minimo', e.target.value)}
            onFocus={focusStyle} onBlur={blurStyle} disabled={salvando}/>
          <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Info size={10}/> Alerta disparado abaixo deste valor
          </div>
        </Field>

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