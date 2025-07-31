import { useState, useEffect } from 'react'
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

  // Carregar dados do localStorage e verificar API
  useEffect(() => {
    const initializeApp = async () => {
      // Carregar dados salvos
      const savedUser = localStorage.getItem('desabafa-user')
      const savedEntries = localStorage.getItem('desabafa-entries')
      const savedTheme = localStorage.getItem('desabafa-theme')
      
      if (savedUser) {
        setUserName(JSON.parse(savedUser).name)
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
    }

    initializeApp()
  }, [])

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('desabafa-theme', !darkMode ? 'dark' : 'light')
  }

  const handleUserRegister = () => {
    if (userName.trim()) {
      const userData = {
        name: userName,
        id: Date.now().toString(),
        deviceId: getDeviceId(),
        createdAt: new Date().toISOString()
      }
      localStorage.setItem('desabafa-user', JSON.stringify(userData))
      setCurrentView('diary')
    }
  }

  const handleSaveEntry = async () => {
    if (currentEntry.trim()) {
      setIsProcessingAI(true)
      
      const newEntry = {
        id: Date.now().toString(),
        content: currentEntry,
        mood: mood,
        createdAt: new Date().toISOString(),
        aiResponse: null,
        deviceId: getDeviceId()
      }
      
      // Salvar entrada imediatamente
      const updatedEntries = [newEntry, ...entries]
      setEntries(updatedEntries)
      localStorage.setItem('desabafa-entries', JSON.stringify(updatedEntries))
      
      // Processar resposta da IA em background
      try {
        const userContext = { name: userName }
        const aiResponse = await generateTherapistResponse(currentEntry, userContext)
        
        // Atualizar entrada com resposta da IA
        newEntry.aiResponse = aiResponse
        const entriesWithAI = [newEntry, ...entries]
        setEntries(entriesWithAI)
        localStorage.setItem('desabafa-entries', JSON.stringify(entriesWithAI))
        
      } catch (error) {
        console.error('Erro ao processar IA:', error)
      } finally {
        setIsProcessingAI(false)
      }
      
      setCurrentEntry('')
      setMood(3)
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
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            disabled={!userName.trim()}
          >
            Começar minha jornada
          </Button>
          
          {/* Status da API */}
          <div className="text-xs text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              {apiStatus.checking ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-muted-foreground">Verificando IA terapeuta...</span>
                </>
              ) : apiStatus.available ? (
                <>
                  <Bot className="w-3 h-3 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">IA terapeuta disponível</span>
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-orange-500" />
                  <span className="text-orange-600 dark:text-orange-400">IA em modo offline</span>
                </>
              )}
            </div>
            <p className="text-muted-foreground">
              Seus dados ficam seguros no seu dispositivo. Nada é enviado para servidores externos.
            </p>
            {deviceInfo && (
              <p className="text-muted-foreground">
                ID do dispositivo: {deviceInfo.id.slice(0, 8)}...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const DiaryScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-10">
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
              onClick={() => setCurrentView('history')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Histórico
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
            <Textarea
              placeholder="Desabafe aqui... Conte como você está se sentindo, o que aconteceu hoje, suas preocupações ou alegrias. Não há julgamentos, apenas apoio."
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              className="min-h-32 resize-none"
              disabled={isProcessingAI}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Como você se sente?</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setMood(level)}
                      disabled={isProcessingAI}
                      className={`text-lg hover:scale-110 transition-transform ${
                        mood === level ? 'scale-110' : 'opacity-50'
                      } ${isProcessingAI ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {getMoodEmoji(level)}
                    </button>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={handleSaveEntry}
                disabled={!currentEntry.trim() || isProcessingAI}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
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

        {entries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Suas últimas reflexões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entries.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {formatDate(entry.createdAt)}
                      </Badge>
                      <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {entry.content}
                    </p>
                    {entry.aiResponse && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="w-3 h-3 text-blue-500" />
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            IA Terapeuta
                          </span>
                        </div>
                        <p className="text-xs text-blue-800 dark:text-blue-200 line-clamp-3">
                          {entry.aiResponse.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )

  const HistoryScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('diary')}
            >
              ← Voltar
            </Button>
            <h1 className="font-bold text-lg">Histórico de Entradas</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma entrada ainda</h3>
              <p className="text-muted-foreground mb-4">
                Comece escrevendo sobre seu dia para ver suas reflexões aqui.
              </p>
              <Button onClick={() => setCurrentView('diary')}>
                Escrever primeira entrada
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {formatDate(entry.createdAt)}
                    </Badge>
                    <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4">
                    {entry.content}
                  </p>
                  {entry.aiResponse && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Resposta da IA Terapeuta
                        </span>
                        {entry.aiResponse.isOffline && (
                          <Badge variant="outline" className="text-xs">
                            Modo offline
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        {entry.aiResponse.content}
                      </p>
                      {entry.aiResponse.suggestions && entry.aiResponse.suggestions.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            Sugestões:
                          </p>
                          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                            {entry.aiResponse.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span>•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )

  if (currentView === 'welcome') return <WelcomeScreen />
  if (currentView === 'history') return <HistoryScreen />
  return <DiaryScreen />
}

export default App

