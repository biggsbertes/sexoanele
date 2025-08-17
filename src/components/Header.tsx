import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Globe, Menu, X, ChevronDown } from "lucide-react"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const menuItems = [
    "Sobre a Jadlog",
    "Produtos e Serviços", 
    "Unidades e Franquias",
    "Tecnologia",
    "Sustentabilidade",
    "LGPD",
    "Cotação de Valores",
    "Atendimento"
  ]

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      {/* Top bar */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="container mx-auto px-6 py-2">
                     <div className="flex items-center justify-between text-sm">
             <div className="flex items-center space-x-6">
               
             </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600">Português</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">Inglês</span>
              </div>
            </div>
          </div>
        </div>
      </div>

             {/* Main header */}
       <div className="container mx-auto px-6 py-6">
                   <div className="flex items-center justify-between max-w-7xl mx-auto">
                                                  {/* Logo */}
              <div className="flex items-center flex-shrink-0">
                                 <img 
                   src="https://cdn.cookielaw.org/logos/ca573dc2-6848-4d5d-811b-a73af38af8db/351dcc81-561f-44be-ad95-966e6f1bb905/f0416ebe-67db-4d95-aee0-56e49a2678f4/logo_jadlog.png" 
                   alt="Jadlog Logo" 
                   className="w-28 h-20 object-contain cursor-pointer transition-opacity"
                   style={{ filter: 'brightness(1)' }}
                   onClick={() => navigate('/')}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.filter = 'brightness(1.1) saturate(1.2)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.filter = 'brightness(1)';
                   }}
                 />
                                                   <span className="hidden lg:inline text-xs ml-3 font-medium" style={{ color: '#3a3839', marginTop: '4px' }}>
                    Sua encomenda no melhor caminho.
                  </span>
              </div>

               

                         {/* Right side actions */}
             <div className="flex items-center space-x-4 flex-shrink-0">
               {/* Menu Dropdown */}
               <div className="hidden lg:block relative" ref={dropdownRef}>
                                   <Button
                    variant="ghost"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="text-gray-700 font-medium text-sm transition-all duration-200 flex items-center space-x-2 py-2 px-4 hover:bg-transparent hover:text-[#dc003a]"
                  >
                   <span>Serviços</span>
                   <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                 </Button>
               </div>

               {/* Search */}
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setIsSearchOpen(!isSearchOpen)}
                 className="p-2 hover:bg-gray-50 transition-all duration-200 rounded-lg"
               >
                 <Search className="w-5 h-5 text-gray-600" />
               </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-50 transition-all duration-200 rounded-lg"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </Button>
            </div>
          </div>

                                                                     {/* Search bar */}
           <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
             isSearchOpen ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
           }`}>
             <div className="pb-4 flex justify-center">
               <div className="max-w-md w-full">
                 <Input
                   placeholder="Procurar..."
                   className="w-full"
                   autoFocus
                 />
               </div>
             </div>
           </div>

           {/* Menu Categories - Below Header */}
           <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
             isDropdownOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
           }`}>
             <div className="pb-4 border-t border-gray-200">
               <nav className="flex flex-wrap justify-center gap-8 pt-4">
                 {menuItems.map((item, index) => (
                   <a
                     key={index}
                     href="#"
                     className="text-gray-700 font-medium text-sm transition-all duration-200 hover:scale-105"
                     style={{ color: '#374151' }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.color = '#eb0945';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.color = '#374151';
                     }}
                   >
                     {item}
                   </a>
                 ))}
               </nav>
             </div>
           </div>

         {/* Mobile menu */}
         <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
           isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
         }`}>
           <div className="pb-4 border-t border-gray-200">
             <nav className="flex flex-col space-y-3 pt-4">
               {menuItems.map((item, index) => (
                 <a
                   key={index}
                   href="#"
                   className="text-gray-700 hover:text-[#eb0945] font-medium text-sm py-2 transition-all duration-200 hover:translate-x-2 hover:pl-2"
                 >
                   {item}
                 </a>
               ))}
             </nav>
           </div>
         </div>
      </div>
    </header>
  )
}

export default Header
