import { useState } from 'react'
import './App.css'
import SearchBar from './components/public/SearchBar'

function App() {
 

  return (
    <>
 
        <div id="footer">
          <h1 className="footer-title">Gestão Rapida</h1>
            <div className="footer-links">
              <a href="./pages/public/Contato.jsx">Contato</a>
              <a href="./pages/public/Cursos.jsx">Cursos</a>
              <a href="./pages/public/Sobre.jsx">Sobre</a>
            </div>
            <SearchBar/>    
        </div>
        

 
    </>
  )
}

export default App
