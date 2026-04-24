import { useState, useEffect } from 'react';

export default function BuscaDropdown({
  placeholder,
  itens,           // [{ id, label, sublabel, info }]
  selecionado,     // { id, label, ... }
  onSelecionar,
  onLimpar,
  infoSelecionado, // texto extra abaixo quando selecionado (opcional)
}) {
  const [busca, setBusca]               = useState('');
  const [dropdownAberto, setDropdownAberto] = useState(false);

  useEffect(() => {
    if (selecionado) {
      setBusca(selecionado.label);
    } else {
      setBusca(''); // Limpa o texto quando 'selecionado' for null
    }
  }, [selecionado]);

  const filtrados = itens
    .filter(i => i.label.toLowerCase().includes(busca.toLowerCase()))
    .slice(0, 8);

  const inputStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '10px 14px', color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none',
    width: '100%', transition: 'all 0.2s', boxSizing: 'border-box',
    borderColor: selecionado ? 'rgba(16,185,129,0.4)' : 'var(--border)',
    paddingRight: selecionado ? 36 : 14,
  };

  const handleSelecionar = (item) => {
    setBusca(item.label);
    onSelecionar(item);
    setDropdownAberto(false);
  };

  const handleLimpar = () => {
    setBusca('');
    onLimpar();
    setDropdownAberto(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          // MUDANÇA AQUI: O valor agora é sempre o estado 'busca'
          value={busca} 
          placeholder={placeholder}
          onChange={e => {
            setBusca(e.target.value);
            setDropdownAberto(true);
            if (!e.target.value) onLimpar();
          }}
          onFocus={e => {
            setDropdownAberto(true);
            // Se focar e já tiver algo selecionado, limpa para permitir nova busca
            if (selecionado) { 
               onLimpar(); 
               setBusca('');
            }
          }}
          onBlur={() => setTimeout(() => setDropdownAberto(false), 200)}
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '10px 14px',
            color: 'var(--text)',
            width: '100%',
            outline: 'none',
            boxSizing: 'border-box',
            borderColor: selecionado ? '#10b98166' : 'var(--border)',
          }}
        />
        {selecionado && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#10b981' }}>✓</span>
        )}
      </div>

      {/* Dropdown */}
      {dropdownAberto && !selecionado && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, marginTop: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', overflow: 'hidden' }}>

          {filtrados.length === 0 && (
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
              Nenhum resultado encontrado.
            </div>
          )}

          {filtrados.map(item => (
            <div key={item.id}
              onMouseDown={() => handleSelecionar(item)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer', transition: 'background 0.15s', borderBottom: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(79,110,247,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.label}</div>
                {item.sublabel && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{item.sublabel}</div>
                )}
              </div>
              {item.info && (
                <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'Syne', fontWeight: 600, flexShrink: 0 }}>
                  {item.info}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info do selecionado + botão limpar */}
      {selecionado && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, padding: '6px 12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: '#10b981' }}>
            {infoSelecionado ?? selecionado.label}
          </span>
          <button onClick={handleLimpar}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
            onMouseEnter={e => e.currentTarget.style.color='#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}>
            ✕ Limpar
          </button>
        </div>
      )}
    </div>
  );
}