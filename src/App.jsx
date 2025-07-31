import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Heart, PenTool, MessageCircle, Moon, Sun, Plus, Calendar, Smile, Bot, Loader2, Download } from 'lucide-react'
import { getDeviceId, getDeviceInfo } from './lib/deviceFingerprint.js'
import { generateTherapistResponse, checkAPIAvailability } from './lib/openaiService.js'
import { usePWA } from './hooks/usePWA.js'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [currentView, setCurrentView] = useState('welcome') // welcome, diary, history
  const [userName, setUserName] = useState('')
  const [currentEntry, setCurrentEntry] = useState('')
  const [entries, setEntries] = useState([])
  const [mood, setMood] = useState(3)
  const [isProcessingAI, setIsProcessingAI] = useState(false)
  const [apiStatus, setApiStatus] = useState({ available: null, checking: true })
  const [deviceInfo, setDeviceInfo] = useState(null)

  // Hook PWA
  const { isInstallable, isInstalled, installApp } = usePWA()

  // Ref para controle direto do textarea
  const textareaRef = useRef(null)

  // Carregar dados do localStorage apenas uma vez
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Carregar dados salvos
        const savedUser = localStorage.getItem('desabafa-user')
        const savedEntries = localStorage.getItem('desabafa-entries')
        const savedTheme = localStorage.getItem('desabafa-theme')
        
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUserName(userData.name)
          setCurrentView('diary')
        }
        
        if (savedEntries) {
          setEntries(JSON.parse(savedEntries))
        }
        
        if (savedTheme === 'dark') {
          setDarkMode(true)
          document.documentElement.classList.add('dark')
        }

        // Obter informações do dispositivo
        const deviceData = getDeviceInfo()
        setDeviceInfo(deviceData)

        // Verificar disponibilidade da API
        const status = await checkAPIAvailability()
        setApiStatus({ ...status, checking: false })
      } catch (error) {
        console.error('Erro na inicialização:', error)
        setApiStatus({ available: false, checking: false })
      }
    }

    initializeApp()
  }, []) // Dependência vazia para executar apenas uma vez

  const toggleTheme = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('desabafa-theme', newDarkMode ? 'dark' : 'light')
  }

  const handleUserRegister = () => {
    if (userName.trim()) {
      const userData = {
        name: userName.trim(),
        id: Date.now().toString(),
        deviceId: getDeviceId(),
        createdAt: new Date().toISOString()
      }
      localStorage.setItem('desabafa-user', JSON.stringify(userData))
      setCurrentView('diary')
    }
  }

  const handleTextareaChange = (e) => {
    const value = e.target.value
    setCurrentEntry(value)
  }

  const handleSaveEntry = async () => {
    const textareaValue = textareaRef.current?.value || ''
    if (!textareaValue.trim()) return
    
    setIsProcessingAI(true)
    
    const newEntry = {
      id: Date.now().toString(),
      content: textareaValue.trim(),
      mood: mood,
      createdAt: new Date().toISOString(),
      aiResponse: null,
      deviceId: getDeviceId()
    }
    
    try {
      // Salvar entrada imediatamente
      const updatedEntries = [newEntry, ...entries]
      setEntries(updatedEntries)
      localStorage.setItem('desabafa-entries', JSON.stringify(updatedEntries))
      
      // Limpar campos
      setCurrentEntry('')
      setMood(3)
      if (textareaRef.current) {
        textareaRef.current.value = ''
      }
      
      // Processar resposta da IA em background
      if (apiStatus.available) {
        try {
          const userContext = { name: userName }
          const aiResponse = await generateTherapistResponse(textareaValue.trim(), userContext)
          
          // Atualizar entrada com resposta da IA
          newEntry.aiResponse = aiResponse
          const entriesWithAI = [newEntry, ...entries]
          setEntries(entriesWithAI)
          localStorage.setItem('desabafa-entries', JSON.stringify(entriesWithAI))
        } catch (error) {
          console.error('Erro ao processar IA:', error)
        }
      }
    } catch (error) {
      console.error('Erro ao salvar entrada:', error)
    } finally {
      setIsProcessingAI(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMoodEmoji = (moodValue) => {
    const moods = ['😢', '😔', '😐', '😊', '😄']
    return moods[moodValue - 1] || '😐'
  }

  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Desabafa Aí
          </CardTitle>
          <CardDescription className="text-base">
            Seu diário pessoal com IA terapeuta para apoio emocional e bem-estar mental
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Como você gostaria de ser chamado?</label>
            <Input
              placeholder="Digite seu nome completo"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUserRegister()}
            />
          </div>
          <Button 
            onClick={handleUserRegister} 
            className="w-full"
            disabled={!userName.trim()}
          >
            <Heart className="w-4 h-4 mr-2" />
            Começar minha jornada
          </Button>
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
            >
              {darkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {darkMode ? 'Modo Claro' : 'Modo Escuro'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (currentView === 'welcome') {
    return <WelcomeScreen />
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Desabafa Aí</h1>
              <p className="text-sm text-muted-foreground">Olá, {userName}!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isInstallable && !isInstalled && (
              <Button
                variant="outline"
                size="sm"
                onClick={installApp}
                className="hidden sm:flex"
              >
                <Download className="w-4 h-4 mr-2" />
                Instalar App
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView(currentView === 'diary' ? 'history' : 'diary')}
            >
              {currentView === 'diary' ? (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Histórico
                </>
              ) : (
                <>
                  <PenTool className="w-4 h-4 mr-2" />
                  Escrever
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {currentView === 'diary' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="w-5 h-5" />
                Como foi seu dia hoje?
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                Escreva sobre seus sentimentos, pensamentos e experiências. Nossa IA terapeuta está aqui para te apoiar.
                {apiStatus.available ? (
                  <Badge variant="secondary" className="ml-2">
                    <Bot className="w-3 h-3 mr-1" />
                    IA ativa
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-2">
                    <Bot className="w-3 h-3 mr-1" />
                    IA offline
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                ref={textareaRef}
                placeholder="Desabafe aqui... Conte como você está se sentindo, o que aconteceu hoje, suas preocupações ou alegrias. Não há julgamentos, apenas apoio."
                className="w-full min-h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessingAI}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Como você se sente?</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Button
                        key={value}
                        variant={mood === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMood(value)}
                        disabled={isProcessingAI}
                      >
                        {getMoodEmoji(value)}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={handleSaveEntry}
                  disabled={isProcessingAI}
                  className="min-w-32"
                >
                  {isProcessingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Salvar entrada
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {entries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Suas últimas reflexões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entries.slice(0, currentView === 'history' ? entries.length : 3).map((entry) => (
                <div key={entry.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </span>
                    <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                  </div>
                  <p className="text-sm mb-3 text-muted-foreground">{entry.content}</p>
                  
                  {entry.aiResponse && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">IA Terapeuta</span>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{entry.aiResponse}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default App

