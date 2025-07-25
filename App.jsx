import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { CheckCircle, RotateCcw } from 'lucide-react'
import kmsiData from './assets/kmsi_data.json'
import './App.css'

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [shuffledQuestions, setShuffledQuestions] = useState([])

  // Embaralhar questões na primeira renderização
  useEffect(() => {
    const shuffled = [...kmsiData.questions].sort(() => Math.random() - 0.5)
    setShuffledQuestions(shuffled)
  }, [])

  const currentQuestion = shuffledQuestions[currentQuestionIndex]
  const totalQuestions = shuffledQuestions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const hasResponse = currentQuestion && responses[currentQuestion.number]

  const handleResponse = (value) => {
    if (!currentQuestion) return
    setResponses(prev => ({
      ...prev,
      [currentQuestion.number]: parseInt(value)
    }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setResponses({})
    setShowResults(false)
    const shuffled = [...kmsiData.questions].sort(() => Math.random() - 0.5)
    setShuffledQuestions(shuffled)
  }

  const calculateScores = () => {
    const scores = {}
    const interpretations = {}

    Object.entries(kmsiData.scoring_rules).forEach(([dimension, questionNumbers]) => {
      const dimensionScore = questionNumbers.reduce((sum, questionNum) => {
        return sum + (responses[questionNum] || 0)
      }, 0)
      scores[dimension] = dimensionScore

      // Determinar interpretação
      const rules = kmsiData.interpretation_rules[dimension]
      let interpretation = 'Não classificado'
      
      for (const rule of rules) {
        const match = rule.match(/(\d+)–(\d+): (.+)/)
        if (match) {
          const [, min, max, desc] = match
          if (dimensionScore >= parseInt(min) && dimensionScore <= parseInt(max)) {
            interpretation = desc
            break
          }
        }
      }
      interpretations[dimension] = interpretation
    })

    return { scores, interpretations }
  }

  const getInterpretationColor = (interpretation) => {
    if (interpretation.includes('Sem problema')) return 'bg-green-100 text-green-800'
    if (interpretation.includes('Alguns sintomas')) return 'bg-yellow-100 text-yellow-800'
    if (interpretation.includes('Em risco')) return 'bg-orange-100 text-orange-800'
    if (interpretation.includes('intensa') || interpretation.includes('excessiva')) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (showResults) {
    const { scores, interpretations } = calculateScores()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-800">
                Resultados do {kmsiData.title}
              </CardTitle>
              <CardDescription className="text-lg">
                {kmsiData.version_info}
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(scores).map(([dimension, score]) => (
              <Card key={dimension} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{dimension}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-indigo-600">{score}</span>
                    <span className="text-sm text-gray-500">pontos</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge className={`${getInterpretationColor(interpretations[dimension])} border-0`}>
                    {interpretations[dimension]}
                  </Badge>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Faixas de Interpretação:</h4>
                    <ul className="text-sm space-y-1">
                      {kmsiData.interpretation_rules[dimension].map((rule, index) => (
                        <li key={index} className="text-gray-600">• {rule}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button onClick={handleRestart} className="bg-indigo-600 hover:bg-indigo-700">
              <RotateCcw className="mr-2 h-4 w-4" />
              Refazer Inventário
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {kmsiData.title}
            </CardTitle>
            <CardDescription className="text-base">
              {kmsiData.version_info}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Instructions (only on first question) */}
        {currentQuestionIndex === 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-line">
                  {kmsiData.instructions}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Questão {currentQuestionIndex + 1} de {totalQuestions}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% concluído
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQuestion.number}. {currentQuestion.text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={responses[currentQuestion.number]?.toString() || ''}
              onValueChange={handleResponse}
              className="space-y-3"
            >
              {kmsiData.likert_scale.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                  <Label 
                    htmlFor={`option-${option.value}`} 
                    className="flex-1 cursor-pointer text-sm"
                  >
                    <span className="font-medium">{option.value}</span> = {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Anterior
          </Button>
          <Button
            onClick={handleNext}
            disabled={!hasResponse}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isLastQuestion ? 'Ver Resultados' : 'Próxima'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App

