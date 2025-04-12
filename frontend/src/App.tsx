import React, { useState, useEffect , useRef } from 'react';
import { Sun, Moon, Bell, UserCircle2, Search, ChevronDown, Building2, CircleDollarSign, AlertCircle, BarChart3, PieChart, Clock, CheckCircle2, AlertTriangle, Flag, Users, FileText, Home, Settings, MessageCircle, XCircle, Wallet, TrendingUp, Activity, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import Web3 from 'web3';

// Add the following type declaration at the top of the file
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Project {
  id: number;
  name: string;
  department: string;
  allocated: number;
  spent: number;
  status: string;
  progress: number;
  complaints: number;
  expenditures?: Expenditure[];
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface Expenditure {
  id: number;
  amount: number;
  date: string;
  category: string;
  description?: string;
  approvedBy?: string;
}


type UserType = 'citizen' | 'official' | null;

// Web3/Blockchain types
interface Web3State {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  balance: string | null;
  error: string | null;
}

// Add blockchain contract interface
interface BlockchainContract {
  methods: {
    recordExpense: (projectId: number, amount: string, description: string) => {
      send: (options: { from: string }) => Promise<any>;
    };
  };
}


const projects: Project[] = [
  {
    id: 1,
    name: "स्मार्ट सिटी परियोजना / Smart City Project",
    department: "शहरी विकास विभाग / Urban Development",
    allocated: 50000000,
    spent: 20000000,
    status: "प्रगति में / In Progress",
    progress: 40,
    complaints: 2,
    startDate: "2024-01-10",
    endDate: "2024-06-15",
    description: "यह परियोजना नागरिकों के लिए डिजिटल सेवाओं के विकास और कार्यान्वयन पर केंद्रित है। इसमें शामिल है: डिजिटल सेवाओं के लिए बुनियादी ढांचे का विकास, सार्वजनिक सेवाओं के लिए एकीकृत प्लेटफॉर्म का निर्माण, और डिजिटल साक्षरता को बढ़ावा देने के लिए कार्यक्रम।",
    expenditures: [
      {
        id: 1,
        amount: 8000000,
        date: "2024-01-25",
        category: "इन्फ्रास्ट्रक्चर / Infrastructure",
        description: "नेटवर्क उपकरण और हार्डवेयर / Network equipment and hardware",
        approvedBy: "राजेश कुमार / Rajesh Kumar"
      },
      {
        id: 2,
        amount: 7000000,
        date: "2024-02-15",
        category: "सॉफ्टवेयर विकास / Software Development",
        description: "मोबाइल ऐप और वेब पोर्टल / Mobile app and web portal",
        approvedBy: "अनुराधा सिंह / Anuradha Singh"
      },
      {
        id: 3,
        amount: 5000000,
        date: "2024-03-10",
        category: "परामर्श / Consultation",
        description: "प्रोजेक्ट मैनेजमेंट और कंसल्टेंसी / Project management and consultancy",
        approvedBy: "विकास शर्मा / Vikas Sharma"
      }
    ]
  },
  {
    id: 2,
    name: "डिजिटल स्वास्थ्य प्रणाली / Digital Healthcare System",
    department: "स्वास्थ्य विभाग / Health Department",
    allocated: 30000000,
    spent: 28000000,
    status: "पूर्ण / Completed",
    progress: 100,
    complaints: 0,
    startDate: "2023-08-10",
    endDate: "2024-02-28",
    description: "राज्य में स्वास्थ्य सेवाओं को डिजिटल बनाने की परियोजना। इसमें अस्पतालों का कंप्यूटरीकरण, रोगी रिकॉर्ड प्रबंधन प्रणाली और टेलीमेडिसिन सुविधाएं शामिल हैं।",
    expenditures: [
      {
        id: 1,
        amount: 12000000,
        date: "2023-09-15",
        category: "हार्डवेयर / Hardware",
        description: "अस्पतालों में कंप्यूटर और नेटवर्क सिस्टम / Computers and network systems in hospitals",
        approvedBy: "डॉ. प्रीति शर्मा / Dr. Preeti Sharma"
      },
      {
        id: 2,
        amount: 10000000,
        date: "2023-11-10",
        category: "सॉफ्टवेयर / Software",
        description: "स्वास्थ्य प्रबंधन सूचना प्रणाली / Health Management Information System",
        approvedBy: "रमेश गुप्ता / Ramesh Gupta"
      },
      {
        id: 3,
        amount: 6000000,
        date: "2024-01-28",
        category: "प्रशिक्षण / Training",
        description: "स्वास्थ्य कर्मियों का प्रशिक्षण / Training of healthcare workers",
        approvedBy: "नेहा पटेल / Neha Patel"
      }
    ]
  },
  {
    id: 3,
    name: "ग्रामीण शिक्षा कार्यक्रम / Rural Education Program",
    department: "शिक्षा विभाग / Education Department",
    allocated: 20000000,
    spent: 5000000,
    status: "शुरू नहीं हुआ / Not Started",
    progress: 25,
    complaints: 5,
    startDate: "2024-03-01",
    endDate: "2024-12-31",
    description: "ग्रामीण क्षेत्रों में शिक्षा की गुणवत्ता में सुधार के लिए कार्यक्रम। यह स्कूलों के बुनियादी ढांचे, शिक्षक प्रशिक्षण और शैक्षिक सामग्री पर ध्यान केंद्रित करता है।",
    expenditures: [
      {
        id: 1,
        amount: 3000000,
        date: "2024-03-20",
        category: "बुनियादी ढांचा / Infrastructure",
        description: "कक्षा उपकरण और फर्नीचर / Classroom equipment and furniture",
        approvedBy: "संजय मिश्रा / Sanjay Mishra"
      },
      {
        id: 2,
        amount: 2000000,
        date: "2024-04-05",
        category: "शिक्षण सामग्री / Teaching Material",
        description: "पाठ्यपुस्तकें और शिक्षण संसाधन / Textbooks and teaching resources",
        approvedBy: "मीना देसाई / Meena Desai"
      }
    ]
  }
];


const complaints = [
  {
    id: 1,
    projectId: 1,
    projectName: "स्मार्ट सिटी परियोजना / Smart City Project",
    status: "लंबित / Pending",
    date: "2024-03-15",
    description: "परियोजना में देरी हो रही है / Project is getting delayed",
    response: null,
  },
  {
    id: 2,
    projectId: 1,
    projectName: "स्मार्ट सिटी परियोजना / Smart City Project",
    status: "समाधान किया गया / Resolved",
    date: "2024-03-10",
    description: "गुणवत्ता मानकों का पालन नहीं किया जा रहा है / Quality standards are not being followed",
    response: "मामले की जांच की गई और सुधारात्मक कार्रवाई की गई / Matter was investigated and corrective action taken",
  },
  {
    id: 3,
    projectId: 3,
    projectName: "ग्रामीण शिक्षा कार्यक्रम / Rural Education Program",
    status: "लंबित / Pending",
    date: "2024-03-14",
    description: "शिक्षकों की कमी / Shortage of teachers",
    response: null,
  },
];

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showProjectDetailsModal, setShowProjectDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [showPassword, setShowPassword] = useState(false);
  
  // Web3/MetaMask state
  const [web3State, setWeb3State] = useState<Web3State>({
    isConnected: false,
    account: null,
    chainId: null,
    balance: null,
    error: null
  });
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    setIsLoggedIn(true);
    setUserType(email.endsWith('@gov.in') ? 'official' : 'citizen');
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    // Keep track of the currently focused element
    if (document.activeElement === emailRef.current) {
      setTimeout(() => emailRef.current?.focus(), 0);
    } else if (document.activeElement === passwordRef.current) {
      setTimeout(() => passwordRef.current?.focus(), 0);
    }
  };

  const SignInPage = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className={`w-full max-w-md p-8 space-y-8 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            alt="National Emblem"
            className="h-20 mx-auto mb-2"
          />
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {isSignUp ? 'नया खाता बनाएं / Create Account' : 'लॉग इन / Sign In'}
          </h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isSignUp 
              ? 'सार्वजनिक निधि ट्रैकर पर नया खाता बनाएं / Create a new account on ArthSetu'
              : 'अपने खाते में प्रवेश करें / Access your account'}
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="flex justify-center space-x-4 mb-6">
            <button
              className={`px-4 py-2 rounded-lg ${
                userType === 'citizen' 
                  ? 'bg-blue-600 text-white' 
                  : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`
              }`}
              onClick={() => setUserType('citizen')}
            >
              नागरिक / Citizen
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                userType === 'official' 
                  ? 'bg-blue-600 text-white' 
                  : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`
              }`}
              onClick={() => setUserType('official')}
            >
              अधिकारी / Official
            </button>
          </div>
          
          {isSignUp && (
            <div>
              <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                नाम / Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={handleInputChange(setName)}
                  className={`appearance-none block w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              ईमेल / Email
            </label>
            <div className="mt-1 relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                ref={emailRef}
                value={email}
                onChange={handleInputChange(setEmail)}
                className={`appearance-none block w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder={userType === 'official' ? 'name@gov.in' : 'name@example.com'}
              />
              <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            {userType === 'official' && (
              <p className="mt-1 text-xs text-blue-500">
                सरकारी अधिकारियों के लिए @gov.in ईमेल आवश्यक है / @gov.in email required for government officials
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              पासवर्ड / Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                ref={passwordRef}
                value={password}
                onChange={handleInputChange(setPassword)}
                className={`appearance-none block w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                मुझे याद रखें / Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                पासवर्ड भूल गए? / Forgot password?
              </a>
            </div>
          </div>
          
          <div>
            <button
              onClick={handleLogin}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSignUp ? 'साइन अप / Sign Up' : 'साइन इन / Sign In'}
            </button>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {isSignUp 
              ? 'पहले से खाता है? साइन इन करें / Already have an account? Sign in' 
              : 'नया खाता बनाएं / Create new account'}
          </button>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex justify-center items-center py-2 px-4 border ${darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'} rounded-md shadow-sm text-sm font-medium focus:outline-none`}
          >
            {darkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
            {darkMode ? 'लाइट मोड / Light Mode' : 'डार्क मोड / Dark Mode'}
          </button>
        </div>
      </div>
    </div>
  );

  const DashboardPage = () => (
    <div className="space-y-6">
      <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>डैशबोर्ड / Dashboard</h2>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
          <div className="flex items-center">
            <CircleDollarSign className="h-10 w-10 text-blue-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>कुल आवंटित / Total Allocated</p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹10,00,00,000</h3>
            </div>
          </div>
        </div>
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
          <div className="flex items-center">
            <Wallet className="h-10 w-10 text-green-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>कुल खर्च / Total Spent</p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹5,30,00,000</h3>
            </div>
          </div>
        </div>
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
          <div className="flex items-center">
            <TrendingUp className="h-10 w-10 text-orange-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>उपयोग प्रतिशत / Utilization</p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>53%</h3>
            </div>
          </div>
        </div>
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
          <div className="flex items-center">
            <Activity className="h-10 w-10 text-purple-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>सक्रिय परियोजनाएं / Active Projects</p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{projects.length}</h3>
            </div>
          </div>
        </div>
      </div>

    
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>परियोजना स्थिति / Project Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>पूर्ण / Completed</span>
              </div>
              <span className="font-medium">1</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>प्रगति में / In Progress</span>
              </div>
              <span className="font-medium">1</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>शुरू नहीं हुआ / Not Started</span>
              </div>
              <span className="font-medium">1</span>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>शिकायत अवलोकन / Complaint Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>लंबित / Pending</span>
              </div>
              <span className="font-medium">2</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>समाधान किया गया / Resolved</span>
              </div>
              <span className="font-medium">1</span>
            </div>
          </div>
        </div>
      </div>

     
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>हाल की परियोजनाएं / Recent Projects</h2>
          <button 
            onClick={() => setCurrentPage('projects')}
            className={`text-blue-600 hover:text-blue-800 text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : ''}`}
          >
            सभी देखें / View All
          </button>
        </div>

        <div className="space-y-4">
          {projects.slice(0, 2).map(project => (
            <div
              key={project.id}
              className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{project.name}</h3>
                  <p className={darkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>{project.department}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {project.status.includes("Completed") ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : project.status.includes("In Progress") ? (
                    <Clock className="h-5 w-5 text-blue-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  )}
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{project.status}</span>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${
                      project.status.includes("Completed")
                        ? "bg-green-500"
                        : project.status.includes("In Progress")
                        ? "bg-blue-500"
                        : "bg-orange-500"
                    } h-2 rounded-full`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ComplaintsPage = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>शिकायतें और निवारण / Complaints & Grievances</h2>
        {!userType && (
          <button 
            onClick={() => setShowComplaintModal(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center"
          >
            + नई शिकायत / New Complaint
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {complaints.map((complaint) => (
          <div key={complaint.id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg border shadow-sm`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{complaint.projectName}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>दिनांक / Date: {complaint.date}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                complaint.status.includes("Resolved") 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {complaint.status}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>शिकायत / Complaint:</p>
                <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{complaint.description}</p>
              </div>
              
              {complaint.response && (
                <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-50'} p-4 rounded-lg`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>प्रतिक्रिया / Response:</p>
                  <p className={`mt-1 ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}>{complaint.response}</p>
                </div>
              )}

              {userType === 'official' && !complaint.response && (
                <div className="flex justify-end">
                  <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">
                    प्रतिक्रिया दें / Respond
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ProjectsPage = () => (
    <>
    
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
          <div className="flex items-center">
            <CircleDollarSign className="h-10 w-10 text-blue-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>कुल आवंटित / Total Allocated</p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹10,00,00,000</h3>
            </div>
          </div>
        </div>
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
          <div className="flex items-center">
            <BarChart3 className="h-10 w-10 text-green-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>कुल खर्च / Total Spent</p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹5,30,00,000</h3>
            </div>
          </div>
        </div>
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
          <div className="flex items-center">
            <PieChart className="h-10 w-10 text-orange-600" />
            <div className="ml-4">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>शेष राशि / Remaining</p>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹4,70,00,000</h3>
            </div>
          </div>
        </div>
      </div>

      
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>सक्रिय परियोजनाएं / Active Projects</h2>
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="परियोजनाएं खोजें / Search projects..."
                className={`w-64 pl-10 pr-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            {userType === 'official' && (
              <button 
                onClick={() => setShowProjectModal(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center"
              >
                + नई परियोजना / New Project
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {projects.map(project => (
            <div
              key={project.id}
              className={`p-6 rounded-lg border ${
                darkMode 
                  ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' 
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              } transition-colors`}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{project.name}</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{project.department}</p>
                </div>
                <div className="flex items-center space-x-6 flex-wrap gap-4">
                  <div className="text-right">
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ₹{project.allocated.toLocaleString('en-IN')}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      खर्च / Spent: ₹{project.spent.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {project.status.includes("Completed") ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : project.status.includes("In Progress") ? (
                      <Clock className="h-5 w-5 text-blue-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                    <span className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{project.status}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowComplaintModal(true);
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        darkMode 
                          ? 'bg-red-900 text-red-200 hover:bg-red-800' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      } text-sm flex items-center`}
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      {project.complaints} शिकायतें / Complaints
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedProject(project);
                        setShowProjectDetailsModal(true);
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      } text-sm`}
                    >
                      विवरण देखें / View Details
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                  <div
                    className={`${
                      project.status.includes("Completed")
                        ? "bg-green-500"
                        : project.status.includes("In Progress")
                        ? "bg-blue-500"
                        : "bg-orange-500"
                    } h-2 rounded-full`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>प्रगति / Progress</span>
                  <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{project.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  // MetaMask connection functions
  const connectMetaMask = async () => {
    try {
      console.log("Connecting to MetaMask...");
      if (typeof window.ethereum === 'undefined') {
        console.error("MetaMask not found");
        alert('मेटामास्क इंस्टॉल नहीं है। कृपया मेटामास्क इंस्टॉल करें / MetaMask is not installed. Please install MetaMask.');
        return;
      }
      
      // Request account access - most important part
      console.log("Requesting accounts...");
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      console.log("Connected accounts:", accounts);
      
      if (!accounts || accounts.length === 0) {
        console.error("No accounts returned");
        alert('कोई खाता नहीं मिला / No accounts found');
        return;
      }
      
      // Get chain ID
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      console.log("Current chain ID:", chainId);
      
      // Update state with account info
      setWeb3State({
        isConnected: true,
        account: accounts[0],
        chainId: parseInt(chainId, 16),
        balance: "0.0",  // We'll skip balance for now to simplify
        error: null
      });
      
      console.log("MetaMask connection successful:", accounts[0]);
      
    } catch (error: any) {
      console.error("MetaMask connection error:", error);
      alert(`वॉलेट कनेक्ट करने में त्रुटि / Error connecting wallet: ${error.message}`);
    }
  };
  
  // Simplified network addition function
  const addArthSetuNetwork = async () => {
    try {
      console.log("Adding ArthSetu network...");
      if (typeof window.ethereum === 'undefined') {
        console.error("MetaMask not found");
        alert('मेटामास्क इंस्टॉल नहीं है। कृपया मेटामास्क इंस्टॉल करें / MetaMask is not installed. Please install MetaMask.');
        return;
      }
      
      // Add network
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x539', // 1337 in hex
          chainName: 'ArthSetu Local Network',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['http://127.0.0.1:8545'],
          blockExplorerUrls: []
        }]
      });
      
      console.log("Network added successfully");
      
    } catch (error: any) {
      console.error("Add network error:", error);
      alert(`नेटवर्क जोड़ने में त्रुटि / Error adding network: ${error.message}`);
    }
  };
  
  // Set up MetaMask event listeners
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      // Handle account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected from MetaMask
          setWeb3State({
            isConnected: false,
            account: null,
            chainId: null,
            balance: null,
            error: null
          });
        } else {
          setWeb3State(prev => ({
            ...prev,
            account: accounts[0],
            isConnected: true
          }));
        }
      });
      
      // Handle chain changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        setWeb3State(prev => ({
          ...prev,
          chainId: parseInt(chainId, 16)
        }));
      });
      
      // Clean up event listeners
      return () => {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      };
    }
  }, []);

  // Add a simple debug mode toggle
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  const DebugPanel = () => {
    if (!showDebug) return null;
    
    return (
      <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} z-50 max-w-md`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">MetaMask Debug Info</h3>
          <button onClick={toggleDebug} className="text-gray-500 hover:text-gray-700">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div>
            <strong>MetaMask Installed:</strong> {typeof window.ethereum !== 'undefined' ? 'Yes ✅' : 'No ❌'}
          </div>
          <div>
            <strong>Connection Status:</strong> {web3State.isConnected ? 'Connected ✅' : 'Disconnected ❌'}
          </div>
          <div>
            <strong>Account:</strong> {web3State.account || 'None'}
          </div>
          <div>
            <strong>Chain ID:</strong> {web3State.chainId || 'Unknown'} {web3State.chainId === 1337 ? '(ArthSetu Local)' : ''}
          </div>
          <div>
            <strong>Error:</strong> {web3State.error || 'None'}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
            <button
              onClick={() => {
                console.log("Current Web3 State:", web3State);
                console.log("Window Ethereum:", window.ethereum);
                alert("Check browser console for detailed debug info");
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm w-full"
            >
              Log Debug Info to Console
            </button>
            
            <button
              onClick={connectMetaMask}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm w-full"
            >
              Try Connect MetaMask Again
            </button>
            
            <button
              onClick={addArthSetuNetwork}
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm w-full"
            >
              Try Add ArthSetu Network Again
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <>
        <SignInPage />
        <div className="fixed bottom-4 right-4">
          <button 
            onClick={toggleDebug}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-full"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
        <DebugPanel />
      </>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
     
      <div className="bg-[#FF6B00] text-white py-1 px-4 text-center text-sm">
        भारत सरकार | Government of India
      </div>

      
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                alt="National Emblem"
                className="h-16"
              />
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>सार्वजनिक निधि ट्रैकर</h1>
                <h2 className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ArthSetu</h2>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* MetaMask Wallet Button */}
              <div className="flex items-center">
                {web3State.isConnected ? (
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Wallet className="h-5 w-5 text-orange-500" />
                    <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {web3State.account?.substring(0, 6)}...{web3State.account?.substring(38)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${web3State.chainId === 1337 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {web3State.chainId === 1337 ? 'ArthSetu' : `Chain: ${web3State.chainId}`}
                    </span>
                    <button
                      onClick={async () => {
                        try {
                          if (!web3State.account) return;
                          
                          const web3 = new Web3(window.ethereum);
                          
                          // Contract ABI and address
                          const authorizeABI = [
                            {
                              "inputs": [
                                {
                                  "internalType": "address",
                                  "name": "official",
                                  "type": "address"
                                }
                              ],
                              "name": "authorizeOfficial",
                              "outputs": [],
                              "stateMutability": "nonpayable",
                              "type": "function"
                            }
                          ];
                          
                          const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
                          const authContract = new web3.eth.Contract(authorizeABI, contractAddress);
                          
                          // This will attempt to authorize the current account as an official
                          // Note: This will only work if the current account is the contract owner
                          await authContract.methods.authorizeOfficial(web3State.account).send({
                            from: web3State.account
                          });
                          
                          alert('आपका खाता अधिकृत है / Your account is authorized');
                        } catch (error: any) {
                          console.error('Authorization error:', error);
                          alert(`अधिकृत करने में त्रुटि / Authorization error: ${error.message}`);
                        }
                      }}
                      className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 ml-2 text-xs"
                    >
                      <Lock className="h-4 w-4" />
                      <span>अधिकृत करें / Authorize</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={connectMetaMask}
                      className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                    >
                      <Wallet className="h-4 w-4" />
                      <span>वॉलेट कनेक्ट करें / Connect Wallet</span>
                    </button>
                    <button
                      onClick={addArthSetuNetwork}
                      className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>ArthSetu नेटवर्क जोड़ें / Add Network</span>
                    </button>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span>{darkMode ? 'लाइट मोड / Light Mode' : 'डार्क मोड / Dark Mode'}</span>
              </button>
              <button
                onClick={() => setIsLoggedIn(false)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <UserCircle2 className="h-5 w-5" />
                <span>{userType === 'official' ? 'अधिकारी पोर्टल / Official Portal' : 'नागरिक पोर्टल / Citizen Portal'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

   
      <nav className="bg-[#1E3A8A] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 space-x-8">
            <a 
              href="#" 
              onClick={() => setCurrentPage('home')}
              className={`flex items-center space-x-2 px-3 py-2 rounded ${currentPage === 'home' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}
            >
              <Home className="h-5 w-5" />
              <span>होम / Home</span>
            </a>
            <a 
              href="#" 
              onClick={() => setCurrentPage('projects')}
              className={`flex items-center space-x-2 px-3 py-2 rounded ${currentPage === 'projects' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}
            >
              <FileText className="h-5 w-5" />
              <span>परियोजनाएं / Projects</span>
            </a>
            <a 
              href="#" 
              onClick={() => setCurrentPage('complaints')}
              className={`flex items-center space-x-2 px-3 py-2 rounded ${currentPage === 'complaints' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}
            >
              <Flag className="h-5 w-5" />
              <span>शिकायतें / Complaints</span>
            </a>
            {userType === 'official' && (
              <a 
                href="#" 
                onClick={() => setCurrentPage('admin')}
                className={`flex items-center space-x-2 px-3 py-2 rounded ${currentPage === 'admin' ? 'bg-blue-800' : 'hover:bg-blue-800'}`}
              >
                <Settings className="h-5 w-5" />
                <span>प्रशासन / Admin</span>
              </a>
            )}
          </div>
        </div>
      </nav>

     
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'home' 
          ? <DashboardPage />
          : currentPage === 'complaints' 
            ? <ComplaintsPage /> 
            : <ProjectsPage />
        }
      </main>

     
      {showComplaintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 max-w-lg w-full mx-4`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">शिकायत दर्ज करें / Register Complaint</h3>
              <button 
                onClick={() => setShowComplaintModal(false)}
                className={`${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  परियोजना / Project
                </label>
                <select className={`w-full p-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg`}>
                  {selectedProject ? (
                    <option value={selectedProject.id}>{selectedProject.name}</option>
                  ) : (
                    projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  शिकायत की श्रेणी / Complaint Category
                </label>
                <select className={`w-full p-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg`}>
                  <option value="delay">समय में देरी / Time Delay</option>
                  <option value="quality">गुणवत्ता से संबंधित / Quality Related</option>
                  <option value="corruption">भ्रष्टाचार / Corruption</option>
                  <option value="funds">फंड का दुरुपयोग / Fund Misuse</option>
                  <option value="others">अन्य / Others</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  शिकायत का विवरण / Complaint Description
                </label>
                <textarea
                  className={`w-full p-3 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg`}
                  rows={4}
                  placeholder="अपनी शिकायत यहां विस्तार से लिखें / Write your complaint in detail here..."
                ></textarea>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  प्रमाण अपलोड करें / Upload Proof
                </label>
                <div className={`border-2 border-dashed ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'} rounded-lg p-4 text-center`}>
                  <input type="file" className="hidden" id="proof-upload" multiple />
                  <label htmlFor="proof-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <svg className={`h-10 w-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        फाइल अपलोड करने के लिए यहां क्लिक करें या खींचें / Click or drag files to upload
                      </p>
                      <p className={`mt-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        अनुमति: JPG, PNG, PDF - अधिकतम 5MB / Allowed: JPG, PNG, PDF - Max 5MB
                      </p>
                    </div>
                  </label>
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="agreement"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="agreement" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    मैं पुष्टि करता/करती हूँ कि उपरोक्त जानकारी सत्य है / I confirm that the above information is true
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowComplaintModal(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                रद्द करें / Cancel
              </button>
              <button
                onClick={() => setShowComplaintModal(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                जमा करें / Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">नई परियोजना जोड़ें / Add New Project</h3>
              <button 
                onClick={() => setShowProjectModal(false)}
                className={`${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  परियोजना का नाम (हिंदी) / Project Name (Hindi)
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg`}
                  placeholder="परियोजना का नाम हिंदी में"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  परियोजना का नाम (अंग्रेजी) / Project Name (English)
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg`}
                  placeholder="Project name in English"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  विभाग / Department
                </label>
                <select className={`w-full p-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg`}>
                  <option value="">विभाग चुनें / Select Department</option>
                  <option value="urban">शहरी विकास / Urban Development</option>
                  <option value="rural">ग्रामीण विकास / Rural Development</option>
                  <option value="education">शिक्षा / Education</option>
                  <option value="health">स्वास्थ्य / Health</option>
                  <option value="infrastructure">बुनियादी ढांचा / Infrastructure</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  बजट / Budget
                </label>
                <input
                  type="number"
                  className={`w-full p-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg`}
                  placeholder="₹"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  प्रारंभ तिथि / Start Date
                </label>
                <input
                  type="date"
                  className={`w-full p-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  अनुमानित समाप्ति तिथि / Expected End Date
                </label>
                <input
                  type="date"
                  className={`w-full p-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg`}
                />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  परियोजना का विवरण / Project Description
                </label>
                <textarea
                  className={`w-full p-3 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg`}
                  rows={4}
                  placeholder="परियोजना का विवरण यहां लिखें / Write project description here..."
                ></textarea>
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  प्राथमिकता / Priority
                </label>
                <div className="flex space-x-4">
                  <label className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <input type="radio" name="priority" className="mr-2" />
                    उच्च / High
                  </label>
                  <label className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <input type="radio" name="priority" className="mr-2" defaultChecked />
                    मध्यम / Medium
                  </label>
                  <label className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <input type="radio" name="priority" className="mr-2" />
                    निम्न / Low
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  अनुलग्नक / Attachments
                </label>
                <div className={`border-2 border-dashed ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'} rounded-lg p-4 text-center`}>
                  <input type="file" className="hidden" id="project-attachments" multiple />
                  <label htmlFor="project-attachments" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <svg className={`h-10 w-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        फाइल अपलोड करने के लिए यहां क्लिक करें या खींचें / Click or drag files to upload
                      </p>
                      <p className={`mt-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        अनुमति: PDF, JPG, PNG, XLSX - अधिकतम 10MB / Allowed: PDF, JPG, PNG, XLSX - Max 10MB
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowProjectModal(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
              >
                रद्द करें / Cancel
              </button>
              <button
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                जमा करें / Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {showProjectDetailsModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{selectedProject.name}</h3>
              <button 
                onClick={() => setShowProjectDetailsModal(false)}
                className={`${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded-lg`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>विभाग / Department</p>
                <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProject.department}</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-green-50'} p-4 rounded-lg`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>स्थिति / Status</p>
                <div className="flex items-center mt-1">
                  {selectedProject.status.includes("Completed") ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  ) : selectedProject.status.includes("In Progress") ? (
                    <Clock className="h-5 w-5 text-blue-500 mr-2" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                  )}
                  <span className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProject.status}</span>
                </div>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-orange-50'} p-4 rounded-lg`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>प्रगति / Progress</p>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className={`${
                        selectedProject.status.includes("Completed")
                          ? "bg-green-500"
                          : selectedProject.status.includes("In Progress")
                          ? "bg-blue-500"
                          : "bg-orange-500"
                      } h-2 rounded-full`}
                      style={{ width: `${selectedProject.progress}%` }}
                    ></div>
                  </div>
                  <span className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProject.progress}%</span>
                </div>
              </div>
            </div>

            {/* Budget Summary */}
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'} p-4 rounded-lg mb-6`}>
              <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>बजट सारांश / Budget Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>कुल आवंटित / Total Allocated</p>
                  <p className="text-xl font-bold">₹{selectedProject.allocated.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>कुल खर्च / Total Spent</p>
                  <p className="text-xl font-bold">₹{selectedProject.spent.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>शेष राशि / Remaining</p>
                  <p className="text-xl font-bold">₹{(selectedProject.allocated - selectedProject.spent).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="h-2 w-full bg-gray-200 mt-4 rounded-full overflow-hidden">
                <div 
                  className="h-2 bg-blue-500" 
                  style={{ width: `${(selectedProject.spent / selectedProject.allocated) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Timeline */}
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'} p-4 rounded-lg mb-6`}>
              <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>समय-सीमा / Timeline</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>प्रारंभ तिथि / Start Date</p>
                  <p className="font-semibold">
                    {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>अनुमानित समाप्ति / Expected End</p>
                  <p className="font-semibold">
                    {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>दिन शेष / Days Remaining</p>
                  <p className="font-semibold">
                    {selectedProject.endDate ? 
                      Math.max(0, Math.ceil((new Date(selectedProject.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'} p-4 rounded-lg mb-6`}>
              <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>परियोजना विवरण / Project Description</h4>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedProject.description || 'कोई विवरण उपलब्ध नहीं / No description available'}</p>
            </div>

            {/* Expenditure Details */}
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'} p-4 rounded-lg mb-6`}>
              <div className="flex justify-between items-center mb-4">
                <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>व्यय विवरण / Expenditure Details</h4>
                {userType === 'official' && (
                  <button 
                    onClick={() => {
                      setSelectedProject(selectedProject);
                      setShowExpenseModal(true);
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    + नया व्यय जोड़ें / Add New Expenditure
                  </button>
                )}
              </div>
              
              {selectedProject.expenditures && selectedProject.expenditures.length > 0 ? (
                <div className={`overflow-x-auto ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-100'}>
                      <tr>
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          दिनांक / Date
                        </th>
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          श्रेणी / Category
                        </th>
                        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          विवरण / Description
                        </th>
                        <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          राशि / Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`${darkMode ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
                      {selectedProject.expenditures.map(exp => (
                        <tr key={exp.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                          <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {new Date(exp.date).toLocaleDateString('hi-IN')}
                          </td>
                          <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{exp.category}</td>
                          <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{exp.description}</td>
                          <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'} text-right font-medium`}>
                            ₹{exp.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className={darkMode ? 'bg-gray-900' : 'bg-gray-100'}>
                      <tr>
                        <td colSpan={3} className={`px-4 py-3 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          कुल / Total
                        </td>
                        <td className={`px-4 py-3 text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'} text-right`}>
                          ₹{selectedProject.expenditures.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} italic text-center py-4`}>
                  कोई व्यय विवरण उपलब्ध नहीं / No expenditure details available
                </p>
              )}
            </div>

            {/* Project Complaints */}
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'} p-4 rounded-lg mb-6`}>
              <div className="flex justify-between items-center mb-4">
                <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>शिकायतें / Complaints</h4>
                {userType === 'citizen' && (
                  <button 
                    onClick={() => {
                      setSelectedProject(selectedProject);
                      setShowProjectDetailsModal(false);
                      setShowComplaintModal(true);
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    + नई शिकायत दर्ज करें / File New Complaint
                  </button>
                )}
              </div>
              
              {complaints.filter(c => c.projectId === selectedProject.id).length > 0 ? (
                <div className="space-y-4">
                  {complaints
                    .filter(c => c.projectId === selectedProject.id)
                    .map(complaint => (
                      <div key={complaint.id} className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>दिनांक / Date: {complaint.date}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            complaint.status.includes("Resolved") 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {complaint.status}
                          </span>
                        </div>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-800'} mb-2`}>{complaint.description}</p>
                        
                        {complaint.response && (
                          <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-50'} p-3 rounded-lg mt-3`}>
                            <p className={`text-xs font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>प्रतिक्रिया / Response:</p>
                            <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>{complaint.response}</p>
                          </div>
                        )}
                        
                        {userType === 'official' && !complaint.response && (
                          <button className="mt-2 px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
                            प्रतिक्रिया दें / Respond
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} italic text-center py-4`}>
                  कोई शिकायत दर्ज नहीं / No complaints filed
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowProjectDetailsModal(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                बंद करें / Close
              </button>
              {userType === 'official' && (
                <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  प्रोजेक्ट अपडेट करें / Update Project
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expenditure Modal */}
      {showExpenseModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 max-w-lg w-full mx-4`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">नया व्यय जोड़ें / Add New Expenditure</h3>
              <button 
                onClick={() => setShowExpenseModal(false)}
                className={`${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            {web3State.isConnected && selectedProject ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                
                // Define variables that need to be accessed in both try and catch blocks
                let submittedDescription = '';
                
                try {
                  if (!web3State.isConnected) {
                    alert('कृपया पहले अपना वॉलेट कनेक्ट करें / Please connect your wallet first');
                    return;
                  }
                  
                  if (!web3State.account) {
                    alert('वॉलेट एकाउंट नहीं मिला / Wallet account not found');
                    return;
                  }
                  
                  const formElement = e.target as HTMLFormElement;
                  const formAmount = formElement.amount.value;
                  const formCategory = formElement.category.value;
                  const formDescription = formElement.description.value;
                  
                  // Store the description in the outer variable for access in catch block
                  submittedDescription = formDescription;
                  
                  if (!formAmount || parseFloat(formAmount) <= 0) {
                    alert('कृपया वैध राशि दर्ज करें / Please enter a valid amount');
                    return;
                  }
                  
                  if (!formDescription) {
                    alert('कृपया विवरण दर्ज करें / Please enter a description');
                    return;
                  }
                  
                  // Show success message first for better user experience
                  alert('व्यय दर्ज किया जा रहा है, कृपया MetaMask अनुरोध की पुष्टि करें / Recording expenditure, please confirm the MetaMask request');
                  
                  // Initialize Web3 with the Ethereum provider
                  const web3 = new Web3(window.ethereum);
                  
                  // Create a new expenditure object before the blockchain transaction
                  // This provides immediate UI feedback
                  const newExpenditure: Expenditure = {
                    id: (selectedProject.expenditures?.length || 0) + 1,
                    amount: parseFloat(formAmount) * 100, // Convert to paise/smallest unit
                    date: new Date().toISOString().split('T')[0],
                    category: formCategory,
                    description: formDescription,
                    approvedBy: 'Pending Blockchain Confirmation'
                  };
                  
                  // Update UI immediately (optimistic update)
                  setSelectedProject(prev => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      expenditures: [...(prev.expenditures || []), newExpenditure]
                    };
                  });
                  
                  // Close modal immediately for better UX
                  setShowExpenseModal(false);
                  
                  const contractABI = [
                    {
                      "inputs": [],
                      "stateMutability": "nonpayable",
                      "type": "constructor"
                    },
                    {
                      "anonymous": false,
                      "inputs": [
                        {
                          "indexed": true,
                          "internalType": "uint256",
                          "name": "projectId",
                          "type": "uint256"
                        },
                        {
                          "indexed": false,
                          "internalType": "uint256",
                          "name": "transactionId",
                          "type": "uint256"
                        },
                        {
                          "indexed": false,
                          "internalType": "uint256",
                          "name": "amount",
                          "type": "uint256"
                        }
                      ],
                      "name": "FundsAllocated",
                      "type": "event"
                    },
                    {
                      "anonymous": false,
                      "inputs": [
                        {
                          "indexed": true,
                          "internalType": "uint256",
                          "name": "projectId",
                          "type": "uint256"
                        },
                        {
                          "indexed": false,
                          "internalType": "uint256",
                          "name": "transactionId",
                          "type": "uint256"
                        },
                        {
                          "indexed": false,
                          "internalType": "uint256",
                          "name": "amount",
                          "type": "uint256"
                        },
                        {
                          "indexed": false,
                          "internalType": "string",
                          "name": "description",
                          "type": "string"
                        }
                      ],
                      "name": "FundsSpent",
                      "type": "event"
                    },
                    {
                      "inputs": [
                        {
                          "internalType": "address",
                          "name": "official",
                          "type": "address"
                        }
                      ],
                      "name": "authorizeOfficial",
                      "outputs": [],
                      "stateMutability": "nonpayable",
                      "type": "function"
                    },
                    {
                      "inputs": [
                        {
                          "internalType": "uint256",
                          "name": "projectId",
                          "type": "uint256"
                        },
                        {
                          "internalType": "uint256",
                          "name": "amount",
                          "type": "uint256"
                        },
                        {
                          "internalType": "string",
                          "name": "description",
                          "type": "string"
                        }
                      ],
                      "name": "recordExpense",
                      "outputs": [
                        {
                          "internalType": "uint256",
                          "name": "",
                          "type": "uint256"
                        }
                      ],
                      "stateMutability": "nonpayable",
                      "type": "function"
                    }
                  ];
                  
                  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
                  const contract = new web3.eth.Contract(contractABI, contractAddress) as unknown as BlockchainContract;
                  
                  // Convert amount to wei
                  const amountWei = web3.utils.toWei(formAmount.toString(), 'ether');
                  
                  console.log(`Recording expense: Project ID=${selectedProject.id}, Amount=${amountWei}, Description="${formCategory}: ${formDescription}"`);
                  
                  // Record expense on blockchain
                  await contract.methods.recordExpense(
                    selectedProject.id,
                    amountWei,
                    `${formCategory}: ${formDescription}`
                  ).send({ from: web3State.account });
                  
                  // Update the expenditure after transaction confirmation
                  setSelectedProject(prev => {
                    if (!prev) return null;
                    
                    // Find the pending expenditure and update its status
                    const updatedExpenditures = prev.expenditures?.map(exp => {
                      if (exp.approvedBy === 'Pending Blockchain Confirmation' && 
                          exp.description === formDescription) {
                        return {
                          ...exp,
                          approvedBy: 'Confirmed on Blockchain'
                        };
                      }
                      return exp;
                    });
                    
                    return {
                      ...prev,
                      expenditures: updatedExpenditures
                    };
                  });
                  
                  // Show success message
                  console.log('Transaction successfully recorded on blockchain');
                  
                } catch (error: any) {
                  console.error('Blockchain transaction error:', error);
                  alert(`व्यय दर्ज करने में त्रुटि / Error recording expenditure: ${error.message}`);
                  
                  // Remove the pending transaction from UI on error
                  setSelectedProject(prev => {
                    if (!prev) return null;
                    
                    const filteredExpenditures = prev.expenditures?.filter(exp => 
                      !(exp.approvedBy === 'Pending Blockchain Confirmation' && 
                        exp.description === submittedDescription)
                    );
                    
                    return {
                      ...prev,
                      expenditures: filteredExpenditures
                    };
                  });
                }
              }} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    परियोजना / Project
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedProject.name}
                    className={`w-full p-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} rounded-lg`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    राशि (ETH) / Amount (ETH)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="0.0001"
                    step="0.001"
                    className={`w-full p-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg`}
                    placeholder="0.1"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    श्रेणी / Category
                  </label>
                  <select 
                    name="category"
                    required
                    className={`w-full p-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg`}
                  >
                    <option value="इन्फ्रास्ट्रक्चर / Infrastructure">इन्फ्रास्ट्रक्चर / Infrastructure</option>
                    <option value="सॉफ्टवेयर / Software">सॉफ्टवेयर / Software</option>
                    <option value="परामर्श / Consultation">परामर्श / Consultation</option>
                    <option value="प्रशिक्षण / Training">प्रशिक्षण / Training</option>
                    <option value="सामग्री / Materials">सामग्री / Materials</option>
                    <option value="अन्य / Other">अन्य / Other</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    विवरण / Description
                  </label>
                  <textarea
                    name="description"
                    required
                    className={`w-full p-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg`}
                    rows={3}
                    placeholder="व्यय का विवरण / Description of expenditure"
                  ></textarea>
                </div>
                
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="blockchain-confirm"
                    required
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="blockchain-confirm" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    मैं पुष्टि करता/करती हूँ कि यह लेनदेन ब्लॉकचेन पर दर्ज किया जाएगा और इसे मिटाया नहीं जा सकता / 
                    I confirm that this transaction will be recorded on the blockchain and cannot be deleted
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
                    className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    रद्द करें / Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    दर्ज करें / Record
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6">
                <Wallet className={`h-12 w-12 mx-auto mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  व्यय रिकॉर्ड करने के लिए MetaMask वॉलेट को कनेक्ट करें / 
                  Connect MetaMask wallet to record expenditure
                </p>
                <button
                  onClick={connectMetaMask}
                  className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                >
                  वॉलेट कनेक्ट करें / Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Add this at the end of return, before the closing div */}
      <div className="fixed bottom-4 right-4">
        <button 
          onClick={toggleDebug}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-full"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
      <DebugPanel />
    </div>
  );
}

export default App;
