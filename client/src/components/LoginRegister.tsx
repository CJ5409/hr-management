import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface LoginRegisterProps {
  onLogin: (email: string, password: string) => void;
}

interface Translations {
  [key: string]: any;
}

const translations: Translations = {
  en: {
    pageTitle: "User Login/Register",
    welcomeBack: "Welcome Back",
    welcomeMessage: "Log in to your account and continue exploring the exciting content and services we offer",
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot Password?",
    rememberMe: "Remember Me",
    loginBtn: "Login",
    orLoginWith: "Or login with",
    name: "Name",
    confirmPassword: "Confirm Password",
    agreeTerms: "I agree to the",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    registerBtn: "Register",
    noAccount: "Don't have an account?",
    signUpNow: "Sign Up Now",
    operationSuccess: "Operation Successful",
    loginSuccess: "You have successfully logged in",
    registerSuccess: "Registration successful! Please log in to your account",
    confirm: "Confirm",
    and: "and",
    jobSeeker: "Job Seeker",
    internalEmployee: "Internal Employee",
    seekerLoginTitle: "Job Seeker Login",
    employeeLoginTitle: "Employee Login",
    seekerLoginSubtitle: "Enter your credentials to access your account",
    employeeLoginSubtitle: "Enter your company credentials to log in"
  },
  zh: {
    pageTitle: "用户登录/注册",
    welcomeBack: "欢迎回来",
    welcomeMessage: "登录您的账户，继续探索我们为您提供的精彩内容和服务",
    login: "登录",
    register: "注册",
    email: "邮箱",
    password: "密码",
    forgotPassword: "忘记密码?",
    rememberMe: "记住我",
    loginBtn: "登录",
    orLoginWith: "或使用以下方式登录",
    name: "姓名",
    confirmPassword: "确认密码",
    agreeTerms: "我同意",
    termsOfService: "服务条款",
    privacyPolicy: "隐私政策",
    registerBtn: "注册",
    noAccount: "还没有账号?",
    signUpNow: "立即注册",
    operationSuccess: "操作成功",
    loginSuccess: "您已成功登录系统",
    registerSuccess: "注册成功！请登录您的账号",
    confirm: "确定",
    and: "和",
    jobSeeker: "求职者",
    internalEmployee: "内部员工",
    seekerLoginTitle: "求职者登录",
    employeeLoginTitle: "员工登录",
    seekerLoginSubtitle: "输入您的凭据以访问您的账户",
    employeeLoginSubtitle: "输入公司凭据以登录"
  },
  tw: {
    pageTitle: "用戶登錄/註冊",
    welcomeBack: "歡迎回來",
    welcomeMessage: "登錄您的賬戶，繼續探索我們為您提供的精彩內容和服務",
    login: "登錄",
    register: "註冊",
    email: "郵箱",
    password: "密碼",
    forgotPassword: "忘記密碼?",
    rememberMe: "記住我",
    loginBtn: "登錄",
    orLoginWith: "或使用以下方式登錄",
    name: "姓名",
    confirmPassword: "確認密碼",
    agreeTerms: "我同意",
    termsOfService: "服務條款",
    privacyPolicy: "隱私政策",
    registerBtn: "註冊",
    noAccount: "還沒有賬號?",
    signUpNow: "立即註冊",
    operationSuccess: "操作成功",
    loginSuccess: "您已成功登錄系統",
    registerSuccess: "註冊成功！請登錄您的賬號",
    confirm: "確定",
    and: "和",
    jobSeeker: "求職者",
    internalEmployee: "內部員工",
    seekerLoginTitle: "求職者登錄",
    employeeLoginTitle: "員工登錄",
    seekerLoginSubtitle: "輸入您的憑據以訪問您的賬戶",
    employeeLoginSubtitle: "輸入公司憑據以登錄"
  }
};

const LoginRegister: React.FC<LoginRegisterProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [currentLang, setCurrentLang] = useState<'en' | 'zh' | 'tw'>('en');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [userType, setUserType] = useState<'seeker' | 'employee'>('seeker');

  // Form data
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const t = translations[currentLang];

  // Initialize language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') as 'en' | 'zh' | 'tw' || 'en';
    setCurrentLang(savedLang);
    document.title = t.pageTitle;
  }, [currentLang, t.pageTitle]);

  // Email validation
  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Form validation
  const validateLoginForm = () => {
    if (!loginData.email.trim()) {
      showModalMessage('请输入您的邮箱');
      return false;
    }
    if (!isValidEmail(loginData.email)) {
      showModalMessage('请输入有效的邮箱地址');
      return false;
    }
    if (!loginData.password.trim()) {
      showModalMessage('请输入您的密码');
      return false;
    }
    return true;
  };

  const validateRegisterForm = () => {
    if (!registerData.name.trim()) {
      showModalMessage('请输入您的姓名');
      return false;
    }
    if (!registerData.email.trim()) {
      showModalMessage('请输入您的邮箱');
      return false;
    }
    if (!isValidEmail(registerData.email)) {
      showModalMessage('请输入有效的邮箱地址');
      return false;
    }
    if (!registerData.password.trim()) {
      showModalMessage('请设置密码');
      return false;
    }
    if (registerData.password.length < 8) {
      showModalMessage('密码长度至少为8位');
      return false;
    }
    if (registerData.password !== registerData.confirmPassword) {
      showModalMessage('两次输入的密码不一致');
      return false;
    }
    if (!agreeTerms) {
      showModalMessage('请同意服务条款和隐私政策');
      return false;
    }
    return true;
  };

  // Modal functions
  const showModalMessage = (message: string) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const hideModal = () => {
    setShowModal(false);
  };

  // Handle form submissions
  const handleLogin = async () => {
    if (validateLoginForm()) {
      try {
        const res = await axios.post('/api/auth/login', {
          email: loginData.email,
          password: loginData.password
        });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(user));
        onLogin(user, token);
        showModalMessage(t.loginSuccess);
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.error) {
          showModalMessage(err.response.data.error);
        } else {
          showModalMessage('Login failed');
        }
      }
    }
  };

  const handleRegister = async () => {
    if (validateRegisterForm()) {
      try {
        await axios.post('/api/auth/register', {
          name: registerData.name,
          email: registerData.email,
          password: registerData.password
        });
        showModalMessage(t.registerSuccess);
        setTimeout(() => {
          setIsLoginForm(true);
          setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
        }, 2000);
      } catch (err: any) {
        if (err.response && err.response.status === 409) {
          showModalMessage('User already exists');
        } else {
          showModalMessage('Registration failed');
        }
      }
    }
  };

  // Language switching
  const setLanguage = (lang: 'en' | 'zh' | 'tw') => {
    setCurrentLang(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        hideModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  // User type tab switcher
  const handleUserTypeSwitch = (type: 'seeker' | 'employee') => {
    setUserType(type);
    setIsLoginForm(true); // Always default to login tab on switch
  };

  return (
    <div className="font-inter bg-gray-50 min-h-screen flex items-center justify-center p-4">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 flex space-x-2 z-10">
        <button
          className={`px-3 py-1 rounded text-sm transition-colors ${
            currentLang === 'en' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setLanguage('en')}
        >
          EN
        </button>
        <button
          className={`px-3 py-1 rounded text-sm transition-colors ${
            currentLang === 'zh' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setLanguage('zh')}
        >
          中
        </button>
        <button
          className={`px-3 py-1 rounded text-sm transition-colors ${
            currentLang === 'tw' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setLanguage('tw')}
        >
          繁
        </button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Image Section */}
        <div className="hidden lg:block relative rounded-2xl overflow-hidden shadow-card h-[650px] max-h-[700px] hover:shadow-hover transition-all duration-500">
          <img
            alt="登录背景"
            className="w-full h-full object-cover"
            src="https://design.gemcoder.com/staticResource/echoAiSystemImages/a0050a3fbc2af0265d927e2fbba55643.png"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 flex flex-col justify-center p-12">
            <h2 className="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-white mb-4 leading-tight">
              {t.welcomeBack}
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-md">
              {t.welcomeMessage}
            </p>
            <div className="flex space-x-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                <i className="fas fa-shield-alt text-xl"></i>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                <i className="fas fa-lock text-xl"></i>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                <i className="fas fa-bolt text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="bg-white rounded-2xl shadow-card p-8 lg:p-12 h-[650px] max-h-[700px] flex flex-col hover:shadow-hover transition-all duration-500 overflow-y-auto">
          {/* User Type Selector */}
          <div className="mb-6">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium user-type-btn transition-colors ${userType === 'seeker' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'}`}
                onClick={() => handleUserTypeSwitch('seeker')}
                data-type="seeker"
              >
                {t.jobSeeker}
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium user-type-btn transition-colors ${userType === 'employee' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'}`}
                onClick={() => handleUserTypeSwitch('employee')}
                data-type="employee"
                title="Internal login"
              >
                {t.internalEmployee}
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b mb-8">
            <button
              className={`flex-1 py-3 text-lg font-semibold transition-colors ${
                isLoginForm ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary'
              }`}
              onClick={() => setIsLoginForm(true)}
            >
              {t.login}
            </button>
            {userType === 'seeker' && (
              <button
                className={`flex-1 py-3 text-lg font-semibold transition-colors ${
                  !isLoginForm ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary'
                }`}
                onClick={() => setIsLoginForm(false)}
              >
                {t.register}
              </button>
            )}
          </div>

          {/* Login Form */}
          {isLoginForm && userType === 'seeker' && (
            <div className="space-y-6 flex-grow">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 login-title">{t.seekerLoginTitle}</h2>
                <p className="text-gray-500 text-sm login-subtitle">{t.seekerLoginSubtitle}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="login-email">
                  {t.email}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-envelope text-gray-400"></i>
                  </div>
                  <input
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 input-focus transition-all"
                    id="login-email"
                    type="email"
                    placeholder={`Please enter your ${t.email.toLowerCase()}`}
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="login-password">
                    {t.password}
                  </label>
                  <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                    {t.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-gray-400"></i>
                  </div>
                  <input
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 input-focus transition-all"
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder={`Please enter your ${t.password.toLowerCase()}`}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    type="button"
                  >
                    <i className={`fas ${showLoginPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="ml-2 block text-sm text-gray-700" htmlFor="remember-me">
                  {t.rememberMe}
                </label>
              </div>

              <button
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center"
                onClick={handleLogin}
              >
                <span>{t.loginBtn}</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </button>

              {/* Guest browse button */}
              <button
                className="w-full mt-2 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all flex items-center justify-center"
                type="button"
                onClick={() => navigate('/jobs')}
              >
                <i className="fas fa-user-secret mr-2"></i>
                Want to browse first? <span className="ml-1 text-primary font-semibold">Continue as guest</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">{t.orLoginWith}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <i className="fab fa-google text-red-500 text-xl"></i>
                </button>
                <button className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <i className="fab fa-facebook-f text-blue-600 text-xl"></i>
                </button>
                <button className="flex items-center justify-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <i className="fab fa-twitter text-blue-400 text-xl"></i>
                </button>
              </div>
            </div>
          )}
          {isLoginForm && userType === 'employee' && (
            <div className="space-y-6 flex-grow">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 login-title">{t.employeeLoginTitle}</h2>
                <p className="text-gray-500 text-sm login-subtitle">{t.employeeLoginSubtitle}</p>
              </div>
              {/* Internal employee login form (reuse jobseeker login form) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="login-email">
                  {t.email}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-envelope text-gray-400"></i>
                  </div>
                  <input
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 input-focus transition-all"
                    id="login-email"
                    type="email"
                    placeholder={`Please enter your ${t.email.toLowerCase()}`}
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="login-password">
                    {t.password}
                  </label>
                  <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                    {t.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-gray-400"></i>
                  </div>
                  <input
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 input-focus transition-all"
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder={`Please enter your ${t.password.toLowerCase()}`}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    type="button"
                  >
                    <i className={`fas ${showLoginPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="ml-2 block text-sm text-gray-700" htmlFor="remember-me">
                  {t.rememberMe}
                </label>
              </div>
              <button
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center"
                onClick={handleLogin}
              >
                <span>{t.loginBtn}</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          )}

          {/* Register Form */}
          {!isLoginForm && userType === 'seeker' && (
            <div className="space-y-6 flex-grow">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="register-name">
                  {t.name}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-user text-gray-400"></i>
                  </div>
                  <input
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 input-focus transition-all"
                    id="register-name"
                    type="text"
                    placeholder={`Please enter your ${t.name.toLowerCase()}`}
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="register-email">
                  {t.email}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-envelope text-gray-400"></i>
                  </div>
                  <input
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 input-focus transition-all"
                    id="register-email"
                    type="email"
                    placeholder={`Please enter your ${t.email.toLowerCase()}`}
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="register-password">
                  {t.password}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-gray-400"></i>
                  </div>
                  <input
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 input-focus transition-all"
                    id="register-password"
                    type={showRegisterPassword ? 'text' : 'password'}
                    placeholder={`Please set your ${t.password.toLowerCase()} (at least 8 characters)`}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    type="button"
                  >
                    <i className={`fas ${showRegisterPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="register-confirm-password">
                  {t.confirmPassword}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-gray-400"></i>
                  </div>
                  <input
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 input-focus transition-all"
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={`Please re-enter your ${t.password.toLowerCase()}`}
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    type="button"
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                  </button>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-1"
                  id="agree-terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <label className="ml-2 block text-sm text-gray-700" htmlFor="agree-terms">
                  {t.agreeTerms}{' '}
                  <button className="text-primary hover:underline">
                    {t.termsOfService}
                  </button>{' '}
                  {t.and}{' '}
                  <button className="text-primary hover:underline">
                    {t.privacyPolicy}
                  </button>
                </label>
              </div>

              <button
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center"
                onClick={handleRegister}
              >
                <span>{t.registerBtn}</span>
                <i className="fas fa-user-plus ml-2"></i>
              </button>
            </div>
          )}
          {!isLoginForm && userType === 'employee' && null}

          {/* Mobile Bottom Tip */}
          <div className="mt-8 text-center text-gray-500 text-sm lg:hidden">
            <p>
              {t.noAccount}{' '}
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => setIsLoginForm(false)}
              >
                {t.signUpNow}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 transform transition-all scale-100 opacity-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-green-500 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t.operationSuccess}
              </h3>
              <p className="text-gray-500 mb-6">{modalMessage}</p>
              <button
                className="w-full bg-primary text-white font-medium py-2.5 px-4 rounded-lg hover:bg-primary/90 transition-colors"
                onClick={hideModal}
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginRegister; 