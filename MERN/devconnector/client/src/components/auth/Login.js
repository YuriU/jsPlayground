import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'

export const Login = () => {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { email, password }  = formData;

    const onChange = e => setFormData({...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => { 
        e.preventDefault();
        if(password !== password2) {
            console.log('Passwords dont match');
        } 
        else {
        }
    }

    return (
        <Fragment>
            <h1 className="large text-primary">Sign Up</h1>
            <p className="lead"><i className="fas fa-user"></i> Create Your Account</p>
            <form className="form" onSubmit= { e=> onSubmit(e)}>
                <div className="form-group">
                <input type="email" placeholder="Email Address" name="email" value={email} onChange={e => onChange(e)} required />
                </div>
                <div className="form-group">
                <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    minLength="6"
                    value={password}
                    onChange={e => onChange(e)}
                />
                </div>
                <input type="submit" className="btn btn-primary" value="Register" />
            </form>
            <p className="my-1">
                Dont have an account? <Link to="/register">Sign Up</Link>
            </p>
        </Fragment>
    )
}
