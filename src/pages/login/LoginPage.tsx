import { useState } from 'react';
import './loginPage.scss';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [messageError, setMessageError] = useState<string>("");
    const [emailError, setEmailError] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const doLogin = async () => {
        setEmailError(false);
        setPasswordError(false);
        setMessageError("");

        try {
            await login(email, password);
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);

            if (!email) {
                setEmailError(true);
            }
            if (!password) {
                setPasswordError(true);
            }

            setMessageError('Login failed. Please check your credentials.');
        }
    }

    return (
        <div className='login'>
            <div className='login-card'>
                <h1>Login</h1>
                <form>
                    <label htmlFor='email'>Email: </label>
                    <input
                        type='email'
                        id='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={emailError ? 'error-border' : ''}
                    />
                    {emailError && <div className="error">Email is required</div>}

                    <label htmlFor='password'>Password: </label>
                    <input
                        type='password'
                        id='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={passwordError ? 'error-border' : ''}
                    />
                    {passwordError && <div className="error">Password is required</div>}

                    <button type='button' onClick={doLogin}>Login</button>
                    {messageError && <div className="error">{messageError}</div>}
                </form>
                <div className='register-back'>
                    <span>Don't you have an account?</span>
                    <Link to={'/register'}>
                        <p>Click here...</p>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;
