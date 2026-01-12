'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { Globe, Save, ArrowLeft, Search, Plus } from 'lucide-react'
import { locationApiHelpers } from '@/lib/location-api'
import { CountryFormData } from '@/types'

// Hardcoded list of common countries
const COUNTRY_LIST = [
  { name: 'Afeganistão', code: 'AF', phone_code: '+93', currency: 'AFN' },
  { name: 'África do Sul', code: 'ZA', phone_code: '+27', currency: 'ZAR' },
  { name: 'Albânia', code: 'AL', phone_code: '+355', currency: 'ALL' },
  { name: 'Alemanha', code: 'DE', phone_code: '+49', currency: 'EUR' },
  { name: 'Andorra', code: 'AD', phone_code: '+376', currency: 'EUR' },
  { name: 'Angola', code: 'AO', phone_code: '+244', currency: 'AOA' },
  { name: 'Antígua e Barbuda', code: 'AG', phone_code: '+1', currency: 'XCD' },
  { name: 'Arábia Saudita', code: 'SA', phone_code: '+966', currency: 'SAR' },
  { name: 'Argélia', code: 'DZ', phone_code: '+213', currency: 'DZD' },
  { name: 'Argentina', code: 'AR', phone_code: '+54', currency: 'ARS' },
  { name: 'Armênia', code: 'AM', phone_code: '+374', currency: 'AMD' },
  { name: 'Austrália', code: 'AU', phone_code: '+61', currency: 'AUD' },
  { name: 'Áustria', code: 'AT', phone_code: '+43', currency: 'EUR' },
  { name: 'Azerbaijão', code: 'AZ', phone_code: '+994', currency: 'AZN' },
  { name: 'Bahamas', code: 'BS', phone_code: '+1', currency: 'BSD' },
  { name: 'Bahrein', code: 'BH', phone_code: '+973', currency: 'BHD' },
  { name: 'Bangladesh', code: 'BD', phone_code: '+880', currency: 'BDT' },
  { name: 'Barbados', code: 'BB', phone_code: '+1', currency: 'BBD' },
  { name: 'Bélgica', code: 'BE', phone_code: '+32', currency: 'EUR' },
  { name: 'Belize', code: 'BZ', phone_code: '+501', currency: 'BZD' },
  { name: 'Benin', code: 'BJ', phone_code: '+229', currency: 'XOF' },
  { name: 'Bielorrússia', code: 'BY', phone_code: '+375', currency: 'BYN' },
  { name: 'Bolívia', code: 'BO', phone_code: '+591', currency: 'BOB' },
  { name: 'Bósnia e Herzegovina', code: 'BA', phone_code: '+387', currency: 'BAM' },
  { name: 'Botsuana', code: 'BW', phone_code: '+267', currency: 'BWP' },
  { name: 'Brasil', code: 'BR', phone_code: '+55', currency: 'BRL' },
  { name: 'Brunei', code: 'BN', phone_code: '+673', currency: 'BND' },
  { name: 'Bulgária', code: 'BG', phone_code: '+359', currency: 'BGN' },
  { name: 'Burkina Faso', code: 'BF', phone_code: '+226', currency: 'XOF' },
  { name: 'Burundi', code: 'BI', phone_code: '+257', currency: 'BIF' },
  { name: 'Butão', code: 'BT', phone_code: '+975', currency: 'BTN' },
  { name: 'Cabo Verde', code: 'CV', phone_code: '+238', currency: 'CVE' },
  { name: 'Camarões', code: 'CM', phone_code: '+237', currency: 'XAF' },
  { name: 'Camboja', code: 'KH', phone_code: '+855', currency: 'KHR' },
  { name: 'Canadá', code: 'CA', phone_code: '+1', currency: 'CAD' },
  { name: 'Catar', code: 'QA', phone_code: '+974', currency: 'QAR' },
  { name: 'Cazaquistão', code: 'KZ', phone_code: '+7', currency: 'KZT' },
  { name: 'Chade', code: 'TD', phone_code: '+235', currency: 'XAF' },
  { name: 'Chile', code: 'CL', phone_code: '+56', currency: 'CLP' },
  { name: 'China', code: 'CN', phone_code: '+86', currency: 'CNY' },
  { name: 'Chipre', code: 'CY', phone_code: '+357', currency: 'EUR' },
  { name: 'Colômbia', code: 'CO', phone_code: '+57', currency: 'COP' },
  { name: 'Comores', code: 'KM', phone_code: '+269', currency: 'KMF' },
  { name: 'Congo', code: 'CG', phone_code: '+242', currency: 'XAF' },
  { name: 'Coreia do Norte', code: 'KP', phone_code: '+850', currency: 'KPW' },
  { name: 'Coreia do Sul', code: 'KR', phone_code: '+82', currency: 'KRW' },
  { name: 'Costa do Marfim', code: 'CI', phone_code: '+225', currency: 'XOF' },
  { name: 'Costa Rica', code: 'CR', phone_code: '+506', currency: 'CRC' },
  { name: 'Croácia', code: 'HR', phone_code: '+385', currency: 'HRK' },
  { name: 'Cuba', code: 'CU', phone_code: '+53', currency: 'CUP' },
  { name: 'Dinamarca', code: 'DK', phone_code: '+45', currency: 'DKK' },
  { name: 'Djibouti', code: 'DJ', phone_code: '+253', currency: 'DJF' },
  { name: 'Dominica', code: 'DM', phone_code: '+1', currency: 'XCD' },
  { name: 'Egito', code: 'EG', phone_code: '+20', currency: 'EGP' },
  { name: 'El Salvador', code: 'SV', phone_code: '+503', currency: 'USD' },
  { name: 'Emirados Árabes Unidos', code: 'AE', phone_code: '+971', currency: 'AED' },
  { name: 'Equador', code: 'EC', phone_code: '+593', currency: 'USD' },
  { name: 'Eritreia', code: 'ER', phone_code: '+291', currency: 'ERN' },
  { name: 'Eslováquia', code: 'SK', phone_code: '+421', currency: 'EUR' },
  { name: 'Eslovênia', code: 'SI', phone_code: '+386', currency: 'EUR' },
  { name: 'Espanha', code: 'ES', phone_code: '+34', currency: 'EUR' },
  { name: 'Estados Unidos', code: 'US', phone_code: '+1', currency: 'USD' },
  { name: 'Estônia', code: 'EE', phone_code: '+372', currency: 'EUR' },
  { name: 'Eswatini', code: 'SZ', phone_code: '+268', currency: 'SZL' },
  { name: 'Etiópia', code: 'ET', phone_code: '+251', currency: 'ETB' },
  { name: 'Fiji', code: 'FJ', phone_code: '+679', currency: 'FJD' },
  { name: 'Filipinas', code: 'PH', phone_code: '+63', currency: 'PHP' },
  { name: 'Finlândia', code: 'FI', phone_code: '+358', currency: 'EUR' },
  { name: 'França', code: 'FR', phone_code: '+33', currency: 'EUR' },
  { name: 'Gabão', code: 'GA', phone_code: '+241', currency: 'XAF' },
  { name: 'Gâmbia', code: 'GM', phone_code: '+220', currency: 'GMD' },
  { name: 'Gana', code: 'GH', phone_code: '+233', currency: 'GHS' },
  { name: 'Geórgia', code: 'GE', phone_code: '+995', currency: 'GEL' },
  { name: 'Granada', code: 'GD', phone_code: '+1', currency: 'XCD' },
  { name: 'Grécia', code: 'GR', phone_code: '+30', currency: 'EUR' },
  { name: 'Guatemala', code: 'GT', phone_code: '+502', currency: 'GTQ' },
  { name: 'Guiana', code: 'GY', phone_code: '+592', currency: 'GYD' },
  { name: 'Guiné', code: 'GN', phone_code: '+224', currency: 'GNF' },
  { name: 'Guiné Equatorial', code: 'GQ', phone_code: '+240', currency: 'XAF' },
  { name: 'Guiné-Bissau', code: 'GW', phone_code: '+245', currency: 'XOF' },
  { name: 'Haiti', code: 'HT', phone_code: '+509', currency: 'HTG' },
  { name: 'Honduras', code: 'HN', phone_code: '+504', currency: 'HNL' },
  { name: 'Hungria', code: 'HU', phone_code: '+36', currency: 'HUF' },
  { name: 'Iêmen', code: 'YE', phone_code: '+967', currency: 'YER' },
  { name: 'Índia', code: 'IN', phone_code: '+91', currency: 'INR' },
  { name: 'Indonésia', code: 'ID', phone_code: '+62', currency: 'IDR' },
  { name: 'Irã', code: 'IR', phone_code: '+98', currency: 'IRR' },
  { name: 'Iraque', code: 'IQ', phone_code: '+964', currency: 'IQD' },
  { name: 'Irlanda', code: 'IE', phone_code: '+353', currency: 'EUR' },
  { name: 'Islândia', code: 'IS', phone_code: '+354', currency: 'ISK' },
  { name: 'Israel', code: 'IL', phone_code: '+972', currency: 'ILS' },
  { name: 'Itália', code: 'IT', phone_code: '+39', currency: 'EUR' },
  { name: 'Jamaica', code: 'JM', phone_code: '+1', currency: 'JMD' },
  { name: 'Japão', code: 'JP', phone_code: '+81', currency: 'JPY' },
  { name: 'Jordânia', code: 'JO', phone_code: '+962', currency: 'JOD' },
  { name: 'Kiribati', code: 'KI', phone_code: '+686', currency: 'AUD' },
  { name: 'Kosovo', code: 'XK', phone_code: '+383', currency: 'EUR' },
  { name: 'Kuwait', code: 'KW', phone_code: '+965', currency: 'KWD' },
  { name: 'Laos', code: 'LA', phone_code: '+856', currency: 'LAK' },
  { name: 'Lesoto', code: 'LS', phone_code: '+266', currency: 'LSL' },
  { name: 'Letônia', code: 'LV', phone_code: '+371', currency: 'EUR' },
  { name: 'Líbano', code: 'LB', phone_code: '+961', currency: 'LBP' },
  { name: 'Libéria', code: 'LR', phone_code: '+231', currency: 'LRD' },
  { name: 'Líbia', code: 'LY', phone_code: '+218', currency: 'LYD' },
  { name: 'Liechtenstein', code: 'LI', phone_code: '+423', currency: 'CHF' },
  { name: 'Lituânia', code: 'LT', phone_code: '+370', currency: 'EUR' },
  { name: 'Luxemburgo', code: 'LU', phone_code: '+352', currency: 'EUR' },
  { name: 'Macedônia do Norte', code: 'MK', phone_code: '+389', currency: 'MKD' },
  { name: 'Madagascar', code: 'MG', phone_code: '+261', currency: 'MGA' },
  { name: 'Malásia', code: 'MY', phone_code: '+60', currency: 'MYR' },
  { name: 'Malawi', code: 'MW', phone_code: '+265', currency: 'MWK' },
  { name: 'Maldivas', code: 'MV', phone_code: '+960', currency: 'MVR' },
  { name: 'Mali', code: 'ML', phone_code: '+223', currency: 'XOF' },
  { name: 'Malta', code: 'MT', phone_code: '+356', currency: 'EUR' },
  { name: 'Marrocos', code: 'MA', phone_code: '+212', currency: 'MAD' },
  { name: 'Maurício', code: 'MU', phone_code: '+230', currency: 'MUR' },
  { name: 'Mauritânia', code: 'MR', phone_code: '+222', currency: 'MRU' },
  { name: 'México', code: 'MX', phone_code: '+52', currency: 'MXN' },
  { name: 'Mianmar', code: 'MM', phone_code: '+95', currency: 'MMK' },
  { name: 'Micronésia', code: 'FM', phone_code: '+691', currency: 'USD' },
  { name: 'Moçambique', code: 'MZ', phone_code: '+258', currency: 'MZN' },
  { name: 'Moldávia', code: 'MD', phone_code: '+373', currency: 'MDL' },
  { name: 'Mônaco', code: 'MC', phone_code: '+377', currency: 'EUR' },
  { name: 'Mongólia', code: 'MN', phone_code: '+976', currency: 'MNT' },
  { name: 'Montenegro', code: 'ME', phone_code: '+382', currency: 'EUR' },
  { name: 'Namíbia', code: 'NA', phone_code: '+264', currency: 'NAD' },
  { name: 'Nauru', code: 'NR', phone_code: '+674', currency: 'AUD' },
  { name: 'Nepal', code: 'NP', phone_code: '+977', currency: 'NPR' },
  { name: 'Nicarágua', code: 'NI', phone_code: '+505', currency: 'NIO' },
  { name: 'Níger', code: 'NE', phone_code: '+227', currency: 'XOF' },
  { name: 'Nigéria', code: 'NG', phone_code: '+234', currency: 'NGN' },
  { name: 'Noruega', code: 'NO', phone_code: '+47', currency: 'NOK' },
  { name: 'Nova Zelândia', code: 'NZ', phone_code: '+64', currency: 'NZD' },
  { name: 'Omã', code: 'OM', phone_code: '+968', currency: 'OMR' },
  { name: 'Países Baixos', code: 'NL', phone_code: '+31', currency: 'EUR' },
  { name: 'Palau', code: 'PW', phone_code: '+680', currency: 'USD' },
  { name: 'Panamá', code: 'PA', phone_code: '+507', currency: 'PAB' },
  { name: 'Papua-Nova Guiné', code: 'PG', phone_code: '+675', currency: 'PGK' },
  { name: 'Paquistão', code: 'PK', phone_code: '+92', currency: 'PKR' },
  { name: 'Paraguai', code: 'PY', phone_code: '+595', currency: 'PYG' },
  { name: 'Peru', code: 'PE', phone_code: '+51', currency: 'PEN' },
  { name: 'Polônia', code: 'PL', phone_code: '+48', currency: 'PLN' },
  { name: 'Portugal', code: 'PT', phone_code: '+351', currency: 'EUR' },
  { name: 'Quênia', code: 'KE', phone_code: '+254', currency: 'KES' },
  { name: 'Quirguistão', code: 'KG', phone_code: '+996', currency: 'KGS' },
  { name: 'Reino Unido', code: 'GB', phone_code: '+44', currency: 'GBP' },
  { name: 'República Centro-Africana', code: 'CF', phone_code: '+236', currency: 'XAF' },
  { name: 'República Democrática do Congo', code: 'CD', phone_code: '+243', currency: 'CDF' },
  { name: 'República Dominicana', code: 'DO', phone_code: '+1', currency: 'DOP' },
  { name: 'Romênia', code: 'RO', phone_code: '+40', currency: 'RON' },
  { name: 'Ruanda', code: 'RW', phone_code: '+250', currency: 'RWF' },
  { name: 'Rússia', code: 'RU', phone_code: '+7', currency: 'RUB' },
  { name: 'Samoa', code: 'WS', phone_code: '+685', currency: 'WST' },
  { name: 'San Marino', code: 'SM', phone_code: '+378', currency: 'EUR' },
  { name: 'Santa Lúcia', code: 'LC', phone_code: '+1', currency: 'XCD' },
  { name: 'São Cristóvão e Nevis', code: 'KN', phone_code: '+1', currency: 'XCD' },
  { name: 'São Tomé e Príncipe', code: 'ST', phone_code: '+239', currency: 'STN' },
  { name: 'São Vicente e Granadinas', code: 'VC', phone_code: '+1', currency: 'XCD' },
  { name: 'Seicheles', code: 'SC', phone_code: '+248', currency: 'SCR' },
  { name: 'Senegal', code: 'SN', phone_code: '+221', currency: 'XOF' },
  { name: 'Serra Leoa', code: 'SL', phone_code: '+232', currency: 'SLL' },
  { name: 'Sérvia', code: 'RS', phone_code: '+381', currency: 'RSD' },
  { name: 'Singapura', code: 'SG', phone_code: '+65', currency: 'SGD' },
  { name: 'Síria', code: 'SY', phone_code: '+963', currency: 'SYP' },
  { name: 'Somália', code: 'SO', phone_code: '+252', currency: 'SOS' },
  { name: 'Sri Lanka', code: 'LK', phone_code: '+94', currency: 'LKR' },
  { name: 'Sudão', code: 'SD', phone_code: '+249', currency: 'SDG' },
  { name: 'Sudão do Sul', code: 'SS', phone_code: '+211', currency: 'SSP' },
  { name: 'Suécia', code: 'SE', phone_code: '+46', currency: 'SEK' },
  { name: 'Suíça', code: 'CH', phone_code: '+41', currency: 'CHF' },
  { name: 'Suriname', code: 'SR', phone_code: '+597', currency: 'SRD' },
  { name: 'Tailândia', code: 'TH', phone_code: '+66', currency: 'THB' },
  { name: 'Tajiquistão', code: 'TJ', phone_code: '+992', currency: 'TJS' },
  { name: 'Tanzânia', code: 'TZ', phone_code: '+255', currency: 'TZS' },
  { name: 'Timor-Leste', code: 'TL', phone_code: '+670', currency: 'USD' },
  { name: 'Togo', code: 'TG', phone_code: '+228', currency: 'XOF' },
  { name: 'Tonga', code: 'TO', phone_code: '+676', currency: 'TOP' },
  { name: 'Trinidad e Tobago', code: 'TT', phone_code: '+1', currency: 'TTD' },
  { name: 'Tunísia', code: 'TN', phone_code: '+216', currency: 'TND' },
  { name: 'Turcomenistão', code: 'TM', phone_code: '+993', currency: 'TMT' },
  { name: 'Turquia', code: 'TR', phone_code: '+90', currency: 'TRY' },
  { name: 'Tuvalu', code: 'TV', phone_code: '+688', currency: 'AUD' },
  { name: 'Ucrânia', code: 'UA', phone_code: '+380', currency: 'UAH' },
  { name: 'Uganda', code: 'UG', phone_code: '+256', currency: 'UGX' },
  { name: 'Uruguai', code: 'UY', phone_code: '+598', currency: 'UYU' },
  { name: 'Uzbequistão', code: 'UZ', phone_code: '+998', currency: 'UZS' },
  { name: 'Vanuatu', code: 'VU', phone_code: '+678', currency: 'VUV' },
  { name: 'Vaticano', code: 'VA', phone_code: '+379', currency: 'EUR' },
  { name: 'Venezuela', code: 'VE', phone_code: '+58', currency: 'VES' },
  { name: 'Vietnã', code: 'VN', phone_code: '+84', currency: 'VND' },
  { name: 'Zâmbia', code: 'ZM', phone_code: '+260', currency: 'ZMW' },
  { name: 'Zimbábue', code: 'ZW', phone_code: '+263', currency: 'ZWL' }
]

export default function CreateCountryPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<CountryFormData>({
    name: '',
    code: '',
    phone_code: '',
    currency: '',
    is_active: true
  })

  // Filter countries based on search term
  const filteredCountries = searchTerm
    ? COUNTRY_LIST.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.phone_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.currency?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : COUNTRY_LIST.slice(0, 20) // Show first 20 countries initially

  const handleCountrySelect = (country: typeof COUNTRY_LIST[0]) => {
    setFormData({
      name: country.name,
      code: country.code,
      phone_code: country.phone_code || '',
      currency: country.currency || '',
      is_active: true
    })
    setShowForm(true)
    // Scroll to form
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  const handleInputChange = (field: keyof CountryFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form
      if (!formData.name.trim() || !formData.code.trim()) {
        alert('Nome e código do país são obrigatórios')
        setIsLoading(false)
        return
      }

      console.log("📤 Sending country data:", formData)
      
      // Create new country for tenant
      const result = await locationApiHelpers.createTenantCountry(formData)
      
      if (result) {
        console.log("✅ Country created successfully:", result)
        alert('País adicionado com sucesso!')
        
        // Reset form
        setFormData({
          name: '',
          code: '',
          phone_code: '',
          currency: '',
          is_active: true
        })
        setShowForm(false)
        setSearchTerm('')
        
        // Redirect immediately without setTimeout
        router.push('/admin/locations/countries')
        router.refresh() // Force refresh the destination page
      } else {
        alert('Erro ao adicionar país. Verifique se o código já existe.')
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar país:', error)
      alert('Erro ao adicionar país. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }


  if (!isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  return (
    <AdminLayout title="Adicionar País" subtitle="Escolha um país da lista para adicionar ao seu sistema">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            className="mr-4"
          >
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Adicionar País</h1>
        </div>

        <div className="max-w-6xl">
          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <Search className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Escolher País</h2>
            </div>

            <div className="mb-6">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar País
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome, código, telefone ou moeda do país..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                {filteredCountries.length} países encontrados
              </p>
            </div>

            {/* Countries Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
              {filteredCountries.map((country) => (
                <button
                  key={`${country.code}-${country.name}`}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 group-hover:bg-blue-200">
                      <Globe className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-blue-700">
                        {country.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center mt-1">
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                            {country.code}
                          </span>
                          {country.phone_code && (
                            <span className="ml-2 text-gray-500">{country.phone_code}</span>
                          )}
                        </div>
                        {country.currency && (
                          <div className="text-xs text-gray-500 mt-1">
                            Moeda: {country.currency}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredCountries.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum país encontrado
                </h3>
                <p className="text-gray-600">
                  Tente buscar com outro termo ou verifique a grafia
                </p>
              </div>
            )}
          </div>

          {/* Create Form (shown after country selection) */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-6">
                <Globe className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Confirmar Dados do País
                </h2>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm">
                  <strong>País selecionado:</strong> {formData.name} ({formData.code})
                </p>
                <p className="text-green-700 text-xs mt-1">
                  Revise os dados abaixo e clique em "Salvar" para adicionar ao seu sistema
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do País *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código ISO (2 letras) *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={2}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Telefônico
                    </label>
                    <input
                      type="text"
                      value={formData.phone_code || ''}
                      onChange={(e) => handleInputChange('phone_code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: +55"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Moeda (3 letras)
                    </label>
                    <input
                      type="text"
                      value={formData.currency || ''}
                      onChange={(e) => handleInputChange('currency', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={3}
                      placeholder="Ex: BRL"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => handleInputChange('is_active', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                        País ativo
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Países inativos não aparecerão nas listagens
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    icon={isLoading ? null : <Save className="w-4 h-4" />}
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Salvando...
                      </>
                    ) : (
                      'Salvar País'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Manual Add Button */}
          {!showForm && (
            <div className="text-center mt-8">
              <Button
                onClick={() => {
                  setShowForm(true)
                  setFormData({
                    name: '',
                    code: '',
                    phone_code: '',
                    currency: '',
                    is_active: true
                  })
                }}
                variant="outline"
                icon={<Plus className="w-4 h-4" />}
              >
                Adicionar País Manualmente
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Se não encontrar o país na lista, você pode adicioná-lo manualmente
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}