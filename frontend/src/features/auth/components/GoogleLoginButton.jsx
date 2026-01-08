import { GoogleLogin } from '@react-oauth/google';

export const GoogleLoginButton = ({ onSuccess, onError }) => {
    return (
        <GoogleLogin
            onSuccess={credentialResponse => {
                // This 'credential' is the real idToken
                onSuccess(credentialResponse.credential);
            }}
            onError={() => {
                console.log('Login Failed');
                onError();
            }}
            useOneTap
        />
    );
};