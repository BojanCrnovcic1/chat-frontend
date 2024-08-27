import axios from 'axios';
import  { useState } from 'react'
import { ApiConfig } from '../../config/ApiConfig';
import { Link, useNavigate } from 'react-router-dom';
import './registerPage.scss';

interface RegisterProps {
    username: string;
    email: string;
    password: string;
    profilePicture?: File;
}

const RegisterPage = () => {
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const navigate = useNavigate();


    const doRegister = async () => {
        if (!email || !password || !username) {
            return setErrorMessage('Please fill in all required fields.');
        }

        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);

        try {
            const response = await axios.post<RegisterProps>(ApiConfig.API_URL + 'auth/user/register',{
                username,
                email,
                password,
            })
            if (response.status !== 201) {
                return response.statusText
            }
            else {
                navigate('/');
            }

        } catch (error) {
            setErrorMessage('An error occurred during registration. Please try again.');
        }

    }
  return (
    <div className='register'>
        <div className='register-card'>
            <h1>Register</h1>
            <form>
                <label htmlFor='username'>Username: </label>
                <input type='text' id='username' name='username'  value={username}
                        onChange={(e) => setUsername(e.target.value)} />
                <label htmlFor='email'>Email: </label>
                <input type='email' id='email' name='email'  value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                <label htmlFor='password'>Password: </label>
                <input type='password' id='password' name='password'  value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                <button type='button' onClick={doRegister}>Register</button>
            </form>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <div className='register-back'>
                <span>Do you have an account?</span>
                <Link to={'/login'}>
                    <p>Click here...</p>
                </Link>
            </div>
        </div>
    </div>
  )
}

export default RegisterPage;
