import React, { useState, useEffect } from 'react'
import { localStorageService } from '../../utils/localStorageService'

// Reference ranges for blood test values
const referenceRanges = {
  WBC: { min: 5.0, max: 12.0, unit: '×10³/µL' },
  LYM: { min: 1.5, max: 7.5, unit: '×10³/µL' },
  MON: { min: 0.0, max: 1.0, unit: '×10³/µL' },
  NEU: { min: 2.0, max: 7.0, unit: '×10³/µL' },
  EOS: { min: 0.0, max: 0.5, unit: '×10³/µL' },
  BAS: { min: 0.0, max: 0.1, unit: '×10³/µL' },
  LYMp: { min: 30, max: 60, unit: '%' },
  MONp: { min: 0, max: 8, unit: '%' },
  NEUp: { min: 35, max: 65, unit: '%' },
  EOSp: { min: 0, max: 5, unit: '%' },
  BASp: { min: 0, max: 1, unit: '%' },
  RBC: { min: 6.0, max: 12.0, unit: '×10⁶/µL' },
  HGB: { min: 11.0, max: 19.0, unit: 'g/dL' },
  HCT: { min: 32, max: 52, unit: '%' },
  MCV: { min: 37, max: 58, unit: 'fL' },
  MCH: { min: 12, max: 20, unit: 'pg' },
  MCHC: { min: 30, max: 38, unit: 'g/dL' },
  RDWc: { min: 0, max: 20, unit: '%' },
  RDWs: { min: 0, max: 5, unit: 'fL' },
  PLT: { min: 100, max: 350, unit: '×10³/µL' },
  MPV: { min: 4.5, max: 7.5, unit: 'fL' },
  PCT: { min: 0.1, max: 0.5, unit: '%' },
  PDWc: { min: 0, max: 20, unit: '%' },
  PDWs: { min: 0, max: 5, unit: 'fL' },
  Na: { min: 132, max: 146, unit: 'mEq/L' },
  K: { min: 2.5, max: 5.5, unit: 'mEq/L' },
  tCO2: { min: 20, max: 30, unit: 'mEq/L' },
  CK: { min: 50, max: 300, unit: 'U/L' },
  GLU: { min: 70, max: 110, unit: 'mg/dL' },
  CA: { min: 11.0, max: 13.5, unit: 'mg/dL' },
  BUN: { min: 10, max: 25, unit: 'mg/dL' },
  CRE: { min: 0.8, max: 2.0, unit: 'mg/dL' },
  AST: { min: 150, max: 350, unit: 'U/L' },
  TBIL: { min: 0.5, max: 2.5, unit: 'mg/dL' },
  GGT: { min: 5, max: 25, unit: 'U/L' },
  ALB: { min: 2.5, max: 4.5, unit: 'g/dL' },
  TP: { min: 5.5, max: 7.5, unit: 'g/dL' },
  GLOB: { min: 2.5, max: 4.5, unit: 'g/dL' }
}

const getFlag = (key, value) => {
  if (!value || value === '') return ''
  const range = referenceRanges[key]
  if (!range) return ''
  const numValue = parseFloat(value)
  if (isNaN(numValue)) return ''
  if (numValue < range.min) return 'L'
  if (numValue > range.max) return 'H'
  return 'N'
}

const BloodTestTab = ({ horseId, onToast }) => {
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState('choice') // 'choice' | 'scan' | 'upload' | 'form'
  const [attachment, setAttachment] = useState(null) // { type: 'scan'|'pdf'|'image', name: string, data: string }
  const videoRef = React.useRef(null)
  const canvasRef = React.useRef(null)
  const streamRef = React.useRef(null)
  const fileInputPdfRef = React.useRef(null)
  const fileInputImageRef = React.useRef(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [tests, setTests] = useState([])
  const [formData, setFormData] = useState({
    testDate: new Date().toISOString().slice(0, 16),
    doctor: 'Dr. Smith',
    device: 'VetScan HM5',
    sampleId: '',
    patientId: '',
    notes: '',
    // CBC
    WBC: '', LYM: '', MON: '', NEU: '', EOS: '', BAS: '',
    LYMp: '', MONp: '', NEUp: '', EOSp: '', BASp: '',
    RBC: '', HGB: '', HCT: '', MCV: '', MCH: '', MCHC: '', RDWc: '', RDWs: '',
    PLT: '', MPV: '', PCT: '', PDWc: '', PDWs: '',
    // Chemistry
    Na: '', K: '', tCO2: '', CK: '', GLU: '', CA: '', BUN: '', CRE: '',
    AST: '', TBIL: '', GGT: '', ALB: '', TP: '', GLOB: '',
    // QC Status
    qcHem: '', qcLip: '',     qcIct: ''
  })

  useEffect(() => {
    // Load tests when horseId changes
    const loadedTests = localStorageService.getBloodTests(horseId)
    // Sort by date (newest first)
    loadedTests.sort((a, b) => new Date(b.testDate) - new Date(a.testDate))
    setTests(loadedTests)
  }, [horseId, refreshKey])

  // Camera: start when step is 'scan', stop on unmount or step change
  useEffect(() => {
    if (step !== 'scan' || !showModal) return
    let stream = null
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch (err) {
        onToast('Could not access camera: ' + (err.message || 'Permission denied'), 'error')
        setStep('choice')
      }
    }
    startCamera()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
    }
  }, [step, showModal])

  const closeModal = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setShowModal(false)
    setStep('choice')
    setAttachment(null)
  }

  const handleCapture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth) return
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setAttachment({ type: 'scan', name: 'blood-test-scan.jpg', data: dataUrl })
    setStep('form')
  }

  const handleFileSelect = (e, type) => {
    const file = e.target?.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setAttachment({ type, name: file.name, data: reader.result })
      setStep('form')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const dataToSave = { ...formData }
    if (attachment) {
      dataToSave.attachmentType = attachment.type
      dataToSave.attachmentName = attachment.name
      dataToSave.attachmentData = attachment.data
    }
    localStorageService.saveBloodTest(horseId, dataToSave)
    setRefreshKey(prev => prev + 1)
    onToast('Blood test saved successfully', 'success')
    closeModal()
    // Reset form
    const resetData = {
      testDate: new Date().toISOString().slice(0, 16),
      doctor: 'Dr. Smith',
      device: 'VetScan HM5',
      sampleId: '',
      patientId: '',
      notes: '',
      WBC: '', LYM: '', MON: '', NEU: '', EOS: '', BAS: '',
      LYMp: '', MONp: '', NEUp: '', EOSp: '', BASp: '',
      RBC: '', HGB: '', HCT: '', MCV: '', MCH: '', MCHC: '', RDWc: '', RDWs: '',
      PLT: '', MPV: '', PCT: '', PDWc: '', PDWs: '',
      Na: '', K: '', tCO2: '', CK: '', GLU: '', CA: '', BUN: '', CRE: '',
      AST: '', TBIL: '', GGT: '', ALB: '', TP: '', GLOB: '',
      qcHem: '', qcLip: '', qcIct: ''
    }
    setFormData(resetData)
    setAttachment(null)
    setStep('choice')
  }

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const renderTestField = (key, label) => {
    const range = referenceRanges[key]
    const flag = getFlag(key, formData[key])
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium w-24">{label}</label>
            <input
              type="text"
              value={formData[key]}
              onChange={(e) => updateField(key, e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <span className="text-xs text-gray-500 w-16">{range?.unit || ''}</span>
            <span className="text-xs text-gray-500 w-24">
              ({range?.min}-{range?.max})
            </span>
            {flag && (
              <span className={`w-6 text-center font-bold ${
                flag === 'L' ? 'text-blue-600' : flag === 'H' ? 'text-red-600' : 'text-green-600'
              }`}>
                {flag}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => { setStep('choice'); setAttachment(null); setShowModal(true); }}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          New Blood Test
        </button>
      </div>

      {/* Saved Tests - Receipt Style */}
      {tests.length > 0 && (
        <div className="space-y-4">
          {tests.map((test) => (
            <div key={test.id} className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-300">
              {/* Receipt Header */}
              <div className="border-b-2 border-gray-400 pb-4 mb-4">
                <div className="text-center mb-3">
                  <div className="font-bold text-xl text-gray-900">VETERINARY BLOOD TEST REPORT</div>
                  <div className="text-sm text-gray-600 mt-1">{test.device}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                  <div>
                    <span className="font-semibold text-gray-700">Test Date:</span>{' '}
                    <span className="text-gray-900">{new Date(test.testDate).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Doctor:</span>{' '}
                    <span className="text-gray-900">{test.doctor}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Sample ID:</span>{' '}
                    <span className="text-gray-900">{test.sampleId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Patient ID:</span>{' '}
                    <span className="text-gray-900">{test.patientId || 'N/A'}</span>
                  </div>
                </div>
                {test.notes && (
                  <div className="mt-3 text-sm">
                    <span className="font-semibold text-gray-700">Notes:</span>{' '}
                    <span className="text-gray-900">{test.notes}</span>
                  </div>
                )}
                {(test.attachmentType || test.attachmentName) && (
                  <div className="mt-3 text-sm">
                    <span className="font-semibold text-gray-700">Attachment:</span>{' '}
                    <span className="text-gray-900">
                      {test.attachmentType === 'scan' && 'Scanned document'}
                      {test.attachmentType === 'pdf' && `PDF: ${test.attachmentName}`}
                      {test.attachmentType === 'image' && `Image: ${test.attachmentName}`}
                    </span>
                    {test.attachmentData?.startsWith('data:image') && (
                      <img src={test.attachmentData} alt="Blood test" className="mt-2 max-h-32 rounded border border-gray-300 object-contain" />
                    )}
                  </div>
                )}
              </div>

              {/* CBC Section */}
              <div className="mb-6">
                <div className="font-bold text-base mb-3 border-b-2 border-gray-300 pb-2 text-gray-800">
                  CBC (Complete Blood Count)
                </div>
                
                {/* White Blood Cells */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-600 mb-2">White Blood Cells</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Parameter</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Value</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Unit</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {['WBC', 'LYM', 'MON', 'NEU', 'EOS', 'BAS'].map(key => {
                          const range = referenceRanges[key]
                          const flag = getFlag(key, test[key])
                          return (
                            <tr key={key} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">{key}</td>
                              <td className="px-3 py-2 text-center text-gray-900">{test[key] || '-'}</td>
                              <td className="px-3 py-2 text-center text-gray-600">{range?.unit || ''}</td>
                              <td className={`px-3 py-2 text-center font-bold ${
                                flag === 'L' ? 'text-blue-600' : flag === 'H' ? 'text-red-600' : flag === 'N' ? 'text-green-600' : 'text-gray-400'
                              }`}>{flag || '-'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Differential Percentages */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Differential (%)</div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    {['LYMp', 'MONp', 'NEUp', 'EOSp', 'BASp'].map(key => {
                      const range = referenceRanges[key]
                      const flag = getFlag(key, test[key])
                      return (
                        <div key={key} className="bg-gray-50 p-2 rounded">
                          <div className="font-medium text-gray-700">{key}</div>
                          <div className="text-gray-900">{test[key] || '-'} {range?.unit || ''}</div>
                          {flag && (
                            <div className={`text-xs font-bold ${
                              flag === 'L' ? 'text-blue-600' : flag === 'H' ? 'text-red-600' : 'text-green-600'
                            }`}>{flag}</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Red Blood Cells */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Red Blood Cells</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Parameter</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Value</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Unit</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {['RBC', 'HGB', 'HCT', 'MCV', 'MCH', 'MCHC', 'RDWc', 'RDWs'].map(key => {
                          const range = referenceRanges[key]
                          const flag = getFlag(key, test[key])
                          return (
                            <tr key={key} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">{key}</td>
                              <td className="px-3 py-2 text-center text-gray-900">{test[key] || '-'}</td>
                              <td className="px-3 py-2 text-center text-gray-600">{range?.unit || ''}</td>
                              <td className={`px-3 py-2 text-center font-bold ${
                                flag === 'L' ? 'text-blue-600' : flag === 'H' ? 'text-red-600' : flag === 'N' ? 'text-green-600' : 'text-gray-400'
                              }`}>{flag || '-'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Platelets */}
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-2">Platelets</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Parameter</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Value</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Unit</th>
                          <th className="px-3 py-2 text-center font-semibold text-gray-700">Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {['PLT', 'MPV', 'PCT', 'PDWc', 'PDWs'].map(key => {
                          const range = referenceRanges[key]
                          const flag = getFlag(key, test[key])
                          return (
                            <tr key={key} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">{key}</td>
                              <td className="px-3 py-2 text-center text-gray-900">{test[key] || '-'}</td>
                              <td className="px-3 py-2 text-center text-gray-600">{range?.unit || ''}</td>
                              <td className={`px-3 py-2 text-center font-bold ${
                                flag === 'L' ? 'text-blue-600' : flag === 'H' ? 'text-red-600' : flag === 'N' ? 'text-green-600' : 'text-gray-400'
                              }`}>{flag || '-'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Chemistry Section */}
              <div className="mb-4">
                <div className="font-bold text-base mb-3 border-b-2 border-gray-300 pb-2 text-gray-800">
                  Chemistry / Profile
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Parameter</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-700">Value</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-700">Unit</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-700">Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {['Na', 'K', 'tCO2', 'CK', 'GLU', 'CA', 'BUN', 'CRE', 'AST', 'TBIL', 'GGT', 'ALB', 'TP', 'GLOB'].map(key => {
                        const range = referenceRanges[key]
                        const flag = getFlag(key, test[key])
                        return (
                          <tr key={key} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium text-gray-900">{key === 'Na' ? 'Na+' : key === 'K' ? 'K+' : key}</td>
                            <td className="px-3 py-2 text-center text-gray-900">{test[key] || '-'}</td>
                            <td className="px-3 py-2 text-center text-gray-600">{range?.unit || ''}</td>
                            <td className={`px-3 py-2 text-center font-bold ${
                              flag === 'L' ? 'text-blue-600' : flag === 'H' ? 'text-red-600' : flag === 'N' ? 'text-green-600' : 'text-gray-400'
                            }`}>{flag || '-'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* QC Status */}
              {(test.qcHem || test.qcLip || test.qcIct) && (
                <div className="border-t-2 border-gray-300 pt-3 mt-4">
                  <div className="font-semibold text-sm text-gray-700 mb-2">QC Status:</div>
                  <div className="flex gap-4 text-xs">
                    {test.qcHem && (
                      <div className="bg-gray-50 px-3 py-1 rounded">
                        <span className="font-medium text-gray-700">HEM:</span> <span className="text-gray-900">{test.qcHem}</span>
                      </div>
                    )}
                    {test.qcLip && (
                      <div className="bg-gray-50 px-3 py-1 rounded">
                        <span className="font-medium text-gray-700">LIP:</span> <span className="text-gray-900">{test.qcLip}</span>
                      </div>
                    )}
                    {test.qcIct && (
                      <div className="bg-gray-50 px-3 py-1 rounded">
                        <span className="font-medium text-gray-700">ICT:</span> <span className="text-gray-900">{test.qcIct}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hidden file inputs for upload */}
      <input
        type="file"
        ref={fileInputPdfRef}
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'pdf')}
      />
      <input
        type="file"
        ref={fileInputImageRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'image')}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Add Test Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">
                {step === 'choice' && 'New Blood Test'}
                {step === 'scan' && 'Scan Blood Test'}
                {step === 'upload' && 'Upload Blood Test'}
                {step === 'form' && 'New Blood Test'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Step: Choose Upload or Scan */}
            {step === 'choice' && (
              <div className="p-8 flex flex-col items-center gap-6">
                <p className="text-gray-600">Add a new blood test by scanning or uploading a document.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setStep('scan')}
                    className="px-8 py-4 rounded-lg border-2 border-red-600 text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
                  >
                    Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('upload')}
                    className="px-8 py-4 rounded-lg border-2 border-red-600 text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="px-8 py-4 rounded-lg border-2 border-gray-400 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Enter manually
                  </button>
                </div>
              </div>
            )}

            {/* Step: Scan – camera */}
            {step === 'scan' && (
              <div className="p-6">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video max-h-[50vh]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setStep('choice')}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCapture}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Capture
                  </button>
                </div>
              </div>
            )}

            {/* Step: Upload – PDF or image */}
            {step === 'upload' && (
              <div className="p-8 flex flex-col items-center gap-6">
                <p className="text-gray-600">Choose how to upload your blood test document.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputPdfRef.current?.click()}
                    className="px-8 py-4 rounded-lg border-2 border-red-600 text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
                  >
                    Upload as PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputImageRef.current?.click()}
                    className="px-8 py-4 rounded-lg border-2 border-red-600 text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
                  >
                    Image from gallery
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('choice')}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step: Form (manual entry, with optional attachment) */}
            {step === 'form' && (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Attachment preview (scan or upload) */}
              {attachment && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {attachment.type === 'scan' && 'Scanned document'}
                      {attachment.type === 'pdf' && 'PDF: ' + attachment.name}
                      {attachment.type === 'image' && 'Image: ' + attachment.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  {attachment.type !== 'pdf' && attachment.data?.startsWith('data:image') && (
                    <img src={attachment.data} alt="Attachment" className="max-h-40 rounded border border-gray-300 object-contain" />
                  )}
                  {attachment.type === 'pdf' && (
                    <p className="text-sm text-gray-500">PDF attached: {attachment.name}</p>
                  )}
                </div>
              )}

              {/* Test Header */}
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.testDate}
                    onChange={(e) => updateField('testDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor *
                  </label>
                  <select
                    required
                    value={formData.doctor}
                    onChange={(e) => updateField('doctor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Dr. Smith">Dr. Smith</option>
                    <option value="Dr. Johnson">Dr. Johnson</option>
                    <option value="Dr. Williams">Dr. Williams</option>
                    <option value="Dr. Brown">Dr. Brown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device *
                  </label>
                  <select
                    required
                    value={formData.device}
                    onChange={(e) => updateField('device', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="VetScan HM5">VetScan HM5</option>
                    <option value="VetScan VS2">VetScan VS2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sample ID
                  </label>
                  <input
                    type="text"
                    value={formData.sampleId}
                    onChange={(e) => updateField('sampleId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    value={formData.patientId}
                    onChange={(e) => updateField('patientId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* CBC Section */}
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3">CBC Section</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    {['WBC', 'LYM', 'MON', 'NEU', 'EOS', 'BAS'].map(key => renderTestField(key, key))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['LYMp', 'MONp', 'NEUp', 'EOSp', 'BASp'].map(key => renderTestField(key, key))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['RBC', 'HGB', 'HCT', 'MCV', 'MCH', 'MCHC', 'RDWc', 'RDWs'].map(key => renderTestField(key, key))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['PLT', 'MPV', 'PCT', 'PDWc', 'PDWs'].map(key => renderTestField(key, key))}
                  </div>
                </div>
              </div>

              {/* Chemistry Section */}
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3">Chemistry / Profile Section</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    {['Na', 'K', 'tCO2', 'CK', 'GLU', 'CA', 'BUN', 'CRE', 'AST', 'TBIL', 'GGT', 'ALB', 'TP', 'GLOB'].map(key => 
                      renderTestField(key, key === 'Na' ? 'Na+' : key === 'K' ? 'K+' : key)
                    )}
                  </div>
                </div>
              </div>

              {/* QC Status */}
              <div>
                <h4 className="font-semibold mb-3">QC Status</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HEM</label>
                    <input
                      type="text"
                      value={formData.qcHem}
                      onChange={(e) => updateField('qcHem', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LIP</label>
                    <input
                      type="text"
                      value={formData.qcLip}
                      onChange={(e) => updateField('qcLip', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ICT</label>
                    <input
                      type="text"
                      value={formData.qcIct}
                      onChange={(e) => updateField('qcIct', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Save Test
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BloodTestTab
