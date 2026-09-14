import { useState } from 'react'
import './App.css'
import SearchBar from './components/public/SearchBar'

function App() {
 

  return (
    <>
      <section id="header">
        <div className="header-content">
          <h1 className="header-title">Gestão Rapida</h1>
          <p className="header-subtitle">Gerencie seus cursos de forma rápida e eficiente.</p>
         <div id="footer">
            <div className="footer-links">
              <a href="./pages/public/Contato.jsx">Contato</a>
              <a href="./pages/public/Cursos.jsx">Cursos</a>
              <a href="./pages/public/Sobre.jsx">Sobre</a>
            </div>
            <SearchBar/>    
        </div>      
      
        </div>

      </section>
       
        

 
    </>
  )
}

export default App
