import React, { useState } from 'react';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Você pesquisou por: ${searchTerm}`);
    // Adicione aqui a lógica para filtrar ou buscar dados
  };

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
      <input
        type="text"
        placeholder="Digite sua busca..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '8px', fontSize: '16px' }}
      />
      <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Pesquisar
      </button>
    </form>
  );
}
