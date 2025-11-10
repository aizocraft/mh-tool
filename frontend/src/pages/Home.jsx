// src/pages/Home.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { getQuestions, submitSurvey } from '../api';
import Stepper from '../components/Stepper';
import QuestionInput from '../components/QuestionInput';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { Download, CheckCircle, ArrowRight, Sparkles, Info, FileText, ClipboardList, ChevronUp, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';

// Import autoTable properly
import 'jspdf-autotable';

// Extend jsPDF with autoTable
const getAutoTable = () => {
  const doc = new jsPDF();
  // autoTable is automatically added to jsPDF prototype by the import
  return doc;
};

const Home = () => {
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [sections, setSections] = useState(['profile', 'problems']);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const userType = responses['User type *'];
  const containerRef = useRef(null);
  const formRef = useRef(null);

  // Project details data
  const projectDetails = {
    title: "Mkulima Hub - Agricultural Digital Platform",
    objective: "To develop a comprehensive digital platform that connects farmers with agricultural experts, provides crop guidance, and facilitates knowledge sharing to improve farming outcomes in Kenya.",
    features: [
      "Real Time Weather",
      "Expert consultation platform",
      "Regional crop guides",
      "Community forums",
      "Multilingual Support",
      "Mobile payment integration"
    ],
    researchAreas: [
      "Farmer needs assessment",
      "Market validation for digital agriculture",
      "User experience research",
      "Technology adoption barriers"
    ],
    institution: "BSc. Computer Science Final Project",
    timeline: "Visit Project: mkulimahub.vercel.app"
  };

  /* -------------------------------------------------
   *  SCROLL MANAGEMENT
   * ------------------------------------------------- */
  useEffect(() => {
    const handleScroll = () => {
      if (formRef.current) {
        const { scrollTop } = formRef.current;
        setShowScrollTop(scrollTop > 400);
      }
    };

    const formElement = formRef.current;
    if (formElement) {
      formElement.addEventListener('scroll', handleScroll);
      return () => formElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    formRef.current?.scrollTo({ top: formRef.current.scrollHeight, behavior: 'smooth' });
  };

  /* -------------------------------------------------
   *  FETCH QUESTIONS
   * ------------------------------------------------- */
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getQuestions();
      setAllQuestions(data);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  /* -------------------------------------------------
   *  DYNAMIC SECTION LOGIC
   * ------------------------------------------------- */
  useEffect(() => {
    const visible = ['profile', 'problems'];
    if (userType === 'Farmer') visible.push('farmer');
    else if (userType === 'Agricultural Expert') visible.push('expert');
    else if (userType === 'Administrator') visible.push('admin');
    setSections(visible);
  }, [userType]);

  /* -------------------------------------------------
   *  FILTER QUESTIONS FOR CURRENT STEP
   * ------------------------------------------------- */
  useEffect(() => {
    if (!allQuestions.length || !sections.length) return;

    const curSection = sections[step - 1];
    const filtered = allQuestions.filter(q => {
      if (q.section !== curSection) return false;
      if (q.conditional) {
        const [field, value] = q.conditional.split(':');
        const key = field === 'profile.userType' ? 'User type *' : field;
        return responses[key] === value;
      }
      return true;
    });
    setCurrentQuestions(filtered);
  }, [step, sections, allQuestions, responses]);

  /* -------------------------------------------------
   *  HANDLERS
   * ------------------------------------------------- */
  const handleChange = (label, value) => {
    setResponses(p => ({ ...p, [label]: value }));
    if (errors[label]) setErrors(p => ({ ...p, [label]: '' }));
  };

  const validateStep = () => {
    const errs = {};
    currentQuestions.forEach(q => {
      if (
        q.required &&
        (!responses[q.label] ||
          (Array.isArray(responses[q.label]) && !responses[q.label].length))
      ) {
        errs[q.label] = 'Required';
      }
    });
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const goTo = target => {
    if (target < step || (target === step + 1 && validateStep())) {
      setStep(target);
      // Scroll to top with smooth animation
      setTimeout(() => {
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const next = () => {
    if (!validateStep()) {
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector('.error-field');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }
    if (step === sections.length) submit();
    else {
      setStep(s => s + 1);
      // Scroll to top after step change
      setTimeout(() => {
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }
  };

  const prev = () => {
    if (step > 1) {
      setStep(s => s - 1);
      // Scroll to top after step change
      setTimeout(() => {
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }
  };

  /* -------------------------------------------------
   *  FIELD MAPPING
   * ------------------------------------------------- */
  const mapField = label => {
    const map = {
      'County *': 'county',
      'User type *': 'userType',
      'Age *': 'age',
      'Gender': 'gender',
      'Device access *': 'deviceAccess',
      'How often do you face crop losses due to pests/diseases/poor advice? *':
        'cropLossFrequency',
      'Main source of farming advice today? (select all)': 'adviceSources',
      'In the last 12 months, how many times did you speak to a verified expert? *':
        'expertContactCount',
      'Ever lost money due to wrong advice?': 'lostMoney',
      'Would you use stage-by-stage crop guides for your region?': 'useCropGuides',
      'How useful is an AI assistant that speaks local terms? (1–5)':
        'aiAssistantUsefulness',
      'Would you pay via M-Pesa for a 30-min expert chat?': 'payForExpertChat',
      'Top 3 topics you\'d book an expert for?': 'expertTopics',
      'Would you join a moderated forum?': 'joinForum',
      'Internet reliability at farm?': 'internetReliability',
      'Would you offer paid consultations (KES 200–500)?':
        'offerPaidConsultations',
      'Preferred consultation format?': 'preferredFormat',
      'How many farmers could you consult weekly?': 'weeklyConsultationCapacity',
      'Would you use a regional dashboard?': 'useDashboard',
      'What would make you switch to MkulimaHub?': 'switchReasons',
    };
    return map[label] || label.toLowerCase().replace(/[^\w]/g, '_');
  };

  /* -------------------------------------------------
   *  SUBMIT
   * ------------------------------------------------- */
  const submit = async () => {
    const required = allQuestions.filter(
      q => q.required && sections.includes(q.section)
    );
    const missing = required.filter(q => {
      if (q.conditional) {
        const [f, v] = q.conditional.split(':');
        const k = f === 'profile.userType' ? 'User type *' : f;
        if (responses[k] !== v) return false;
      }
      const val = responses[q.label];
      return !val || (Array.isArray(val) && !val.length);
    });

    if (missing.length) {
      toast.error('Complete all required fields');
      const sec = missing[0].section;
      const idx = sections.indexOf(sec);
      if (idx !== -1) setStep(idx + 1);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        profile: {},
        problems: {},
        farmerFeatures: {},
        expertFeatures: {},
        adminFeatures: {},
        submittedAt: new Date().toISOString(),
      };

      allQuestions.forEach(q => {
        const val = responses[q.label];
        if (val === undefined || val === '' || (Array.isArray(val) && !val.length))
          return;
        const field = mapField(q.label);
        const key = {
          profile: 'profile',
          problems: 'problems',
          farmer: 'farmerFeatures',
          expert: 'expertFeatures',
          admin: 'adminFeatures',
        }[q.section];
        if (key) payload[key][field] = val;
      });
      Object.keys(payload).forEach(
        k => !Object.keys(payload[k]).length && delete payload[k]
      );

      await submitSurvey(payload);
      setSubmitted(true);
      toast.success('Thank you for your participation!');
    } catch {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  /* -------------------------------------------------
   *  IMPROVED PDF DOWNLOAD FUNCTIONS
   * ------------------------------------------------- */
  const downloadQuestionnairePDF = () => {
    setDownloading(true);
    
    try {
      const doc = getAutoTable();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 15;

      // Compact Header
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('MKULIMA HUB', pageWidth / 2, 12, { align: 'center' });
      
      doc.setFontSize(9);
      doc.text('Agricultural Research Questionnaire', pageWidth / 2, 20, { align: 'center' });
      
      yPosition = 35;

      // Compact Introduction
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const introText = [
        'Research Objective: This questionnaire is part of the Mkulima Hub research project',
        'aimed at understanding the needs of agricultural stakeholders in Kenya.',
        '',
        'Confidentiality: All responses are anonymous and for academic research purposes.',
        '',
        'Instructions: Please answer all questions. Required questions are marked with *.',
        '________________________________________________________________________'
      ];
      
      introText.forEach(line => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 15;
        }
        doc.text(line, 15, yPosition);
        yPosition += 5;
      });

      // Questions with better formatting
      sections.forEach(section => {
        const sectionQuestions = allQuestions.filter(q => q.section === section);
        if (sectionQuestions.length === 0) return;

        // Section header - more compact
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 15;
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text(`${formatSection(section).toUpperCase()}`, 15, yPosition);
        yPosition += 8;

        // Questions with better spacing
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        sectionQuestions.forEach((question, index) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 15;
          }

          const questionText = `${index + 1}. ${question.label}`;
          const wrappedText = doc.splitTextToSize(questionText, pageWidth - 30);
          
          doc.setFont('helvetica', 'bold');
          doc.text(wrappedText, 15, yPosition);
          yPosition += wrappedText.length * 4 + 3;

          // Compact answer space
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text('Answer: _________________________________________', 20, yPosition);
          yPosition += 8;

          // Minimal space between questions
          yPosition += 2;
        });
      });

      // Compact Footer
      const finalY = doc.internal.pageSize.getHeight() - 10;
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${new Date().toLocaleDateString()} • Mkulima Hub Research`, pageWidth / 2, finalY, { align: 'center' });

      doc.save('MkulimaHub_Questionnaire.pdf');
      toast.success('Questionnaire PDF downloaded!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const downloadResultsPDF = () => {
    setDownloading(true);
    
    try {
      const doc = getAutoTable();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 15;

      // Compact Header
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('MKULIMA HUB', pageWidth / 2, 12, { align: 'center' });
      
      doc.setFontSize(9);
      doc.text('Survey Results Report', pageWidth / 2, 20, { align: 'center' });
      
      yPosition = 35;

      // Compact Respondent info
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      doc.text(`Submission Date: ${new Date().toLocaleString()}`, 15, yPosition);
      yPosition += 6;
      doc.text(`User Type: ${responses['User type *'] || 'Not specified'}`, 15, yPosition);
      yPosition += 6;
      doc.text(`County: ${responses['County *'] || 'Not specified'}`, 15, yPosition);
      yPosition += 10;

      // Compact table with better styling
      const tableData = allQuestions
        .filter(q => sections.includes(q.section))
        .map(q => {
          let answer = responses[q.label];
          if (Array.isArray(answer)) answer = answer.join(', ');
          else if (answer === undefined || answer === '') answer = 'Not answered';
          
          return [
            q.label.replace('*', '').trim(),
            answer
          ];
        });

      // Use autoTable safely
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          head: [['Question', 'Response']],
          body: tableData,
          startY: yPosition,
          theme: 'grid',
          styles: { 
            fontSize: 7,
            cellPadding: 2,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            textColor: [0, 0, 0]
          },
          headStyles: { 
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 8
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 85, fontStyle: 'bold' },
            1: { cellWidth: 100 }
          },
          margin: { left: 10, right: 10 },
          pageBreak: 'auto'
        });
      } else {
        // Fallback if autoTable is not available
        tableData.forEach(([question, answer], index) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 15;
          }
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(question, 15, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.text(answer, 15, yPosition + 4);
          yPosition += 12;
        });
      }

      const finalY = doc.internal.pageSize.getHeight() - 10;
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text('Mkulima Hub Research • BSc Computer Science Final Project', pageWidth / 2, finalY, { align: 'center' });

      doc.save('MkulimaHub_Survey_Results.pdf');
      toast.success('Results PDF downloaded!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  /* -------------------------------------------------
   *  PROJECT MODAL COMPONENT
   * ------------------------------------------------- */
  const ProjectModal = () => (
    <AnimatePresence>
      {showProjectModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowProjectModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">{projectDetails.title}</h2>
              <p className="text-blue-100">{projectDetails.institution}</p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Objective */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  Project Objective
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {projectDetails.objective}
                </p>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                  Key Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {projectDetails.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Research Areas */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                  Research Areas
                </h3>
                <div className="space-y-2">
                  {projectDetails.researchAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300 text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {projectDetails.timeline}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProjectModal(false)}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* -------------------------------------------------
   *  UI HELPERS
   * ------------------------------------------------- */
  const formatSection = s =>
    ({
      profile: 'Profile',
      problems: 'Needs Assessment',
      farmer: 'Market Validation - Farmer',
      expert: 'Market Validation - Expert',
      admin: 'Market Validation - Admin',
    }[s] || s);

  /* -------------------------------------------------
   *  LOADING SCREEN
   * ------------------------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  /* -------------------------------------------------
   *  SUCCESS SCREEN
   * ------------------------------------------------- */
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4"
      >
        <div className="max-w-4xl w-full">
          <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
              className="inline-block p-6 bg-white dark:bg-gray-800 rounded-full shadow-2xl mb-6"
            >
              <CheckCircle className="w-24 h-24 text-green-500" />
            </motion.div>

            <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
              Thank You!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Your responses have been submitted successfully.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" /> Your Answers
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {allQuestions
                  .filter(q => sections.includes(q.section))
                  .map((q, i) => {
                    let ans = responses[q.label];
                    if (Array.isArray(ans)) ans = ans.join(', ');
                    else if (ans === undefined) ans = '—';
                    return (
                      <motion.div
                        key={`${q._id}-${i}`} // Fixed: Added unique key
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex justify-between items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                      >
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {q.label.replace('*', '')}
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 ml-4 text-right">
                          {ans}
                        </span>
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadResultsPDF}
                disabled={downloading}
                className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-xl flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                {downloading ? 'Generating...' : 'Download Results PDF'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadQuestionnairePDF}
                disabled={downloading}
                className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-xl flex items-center justify-center gap-2"
              >
                <ClipboardList className="w-5 h-5" />
                {downloading ? 'Generating...' : 'Download Questionnaire'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSubmitted(false);
                  setResponses({});
                  setStep(1);
                  setSections(['profile', 'problems']);
                }}
                className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-xl shadow-xl"
              >
                New Survey
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  /* -------------------------------------------------
   *  MAIN FORM
   * ------------------------------------------------- */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <motion.h1 
            className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Mkulima Hub
          </motion.h1>
          <motion.p 
            className="mt-3 text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Needs Assessment & Market Validation Tool
          </motion.p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
        >
          {/* Scrollable Form Area */}
          <div 
            ref={formRef}
            className="max-h-[80vh] overflow-y-auto scroll-smooth p-6 sm:p-8"
          >
            <Stepper
              steps={sections.map(formatSection)}
              currentStep={step}
              onStepClick={goTo}
            />
            
            {/* Compact Banner */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 p-3 text-center text-white rounded-2xl mb-6"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-bold">Mkulima Hub Project</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProjectModal(true)}
                  className="px-4 py-1 text-xs bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-all border border-white/30"
                >
                  Project Details
                </motion.button>
              </div>
            </motion.div>

            {/* Section info */}
            <motion.div
              key={`section-${step}`} // Fixed: Added unique key
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="inline-block w-fit mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50"
            >
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300">
                {formatSection(sections[step - 1])}
              </h2>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                Step {step} of {sections.length} • {currentQuestions.length} question
                {currentQuestions.length !== 1 ? 's' : ''}
              </p>
            </motion.div>

            {/* Questions */}
            <motion.div
              key={`questions-${step}`} // Fixed: Added unique key
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {currentQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    {step === sections.length ? 'Ready to submit!' : 'No questions here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {currentQuestions.map((q, i) => (
                    <motion.div
                      key={`${q._id}-${i}`} // Fixed: Added unique key
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, type: "spring", stiffness: 400 }}
                      className={`${errors[q.label] ? 'error-field' : ''}`}
                    >
                      <QuestionInput
                        question={q}
                        value={responses[q.label]}
                        onChange={handleChange}
                        error={errors[q.label]}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4">
              <motion.button
                whileHover={{ scale: step === 1 ? 1 : 1.05 }}
                whileTap={{ scale: step === 1 ? 1 : 0.95 }}
                onClick={prev}
                disabled={step === 1}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  step === 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700 shadow-lg'
                }`}
              >
                Previous
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={next}
                disabled={submitting}
                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
                  submitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl'
                }`}
              >
                {step === sections.length ? 'Submit Survey' : 'Next'}
                <ArrowRight className="w-4 h-4" />
                {submitting && (
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Scroll Buttons */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={scrollToTop}
                className="fixed right-8 bottom-24 w-12 h-12 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40"
              >
                <ChevronUp className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToBottom}
            className="fixed right-8 bottom-8 w-12 h-12 bg-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40"
          >
            <ChevronDown className="w-6 h-6" />
          </motion.button>
        </motion.div>
      </div>

      <ProjectModal />
      <Toaster position="top-center" />
    </motion.div>
  );
};

export default Home;