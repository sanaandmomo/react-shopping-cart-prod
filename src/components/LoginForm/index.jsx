import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Spinner, SpinnerWrapper } from 'styles/Spinner';
import Button from 'styles/Button';
import Wrapper, { SignUpLink } from './styles';
import ErrorWrapper from 'styles/ErrorWrapper';

import Input from 'components/Input';

import { checkEmail, checkPassword } from 'utils/validation';

import { login } from 'reducers/user';
import { onMessage } from 'reducers/snackbar';

import { PATH, SNACKBAR_MESSAGE } from 'constants';
import axios from 'axios';

const LoginForm = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.user.accessToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = useCallback(({ target }) => {
    setEmail(target.value);
  }, []);

  const handlePasswordChange = useCallback(({ target }) => {
    setPassword(target.value);
  }, []);

  useEffect(() => {
    localStorage.setItem('accessToken', accessToken);
    console.log('accessToken: ', accessToken);
  }, [accessToken]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('object');

    let canSubmit = true;

    try {
      checkEmail(email);
      setEmailError('');
    } catch ({ message }) {
      setEmailError(message);
      canSubmit = false;
    }

    try {
      checkPassword(password);
      setPasswordError('');
    } catch ({ message }) {
      setPasswordError(message);
      canSubmit = false;
    }

    if (!canSubmit) return;

    setLoading(true);

    dispatch(login({ email, password }))
      .unwrap()
      .then((result) => {
        console.log('login', result.accessToken);
        localStorage.setItem('accessToken', result.accessToken);
        axios.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${result.accessToken}`;
        navigate(PATH.HOME);
        dispatch(onMessage(SNACKBAR_MESSAGE.successLogin()));
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Wrapper onSubmit={handleFormSubmit}>
      {loading && (
        <SpinnerWrapper>
          <Spinner />
        </SpinnerWrapper>
      )}
      <p className="title">로그인</p>
      <div className="input-wrapper">
        <Input
          label="이메일"
          type="text"
          value={email}
          placeholder="이메일"
          onChange={handleEmailChange}
          isError={emailError}
        />
      </div>
      {emailError && (
        <ErrorWrapper>
          <p>{emailError}</p>
        </ErrorWrapper>
      )}
      <div className="input-wrapper">
        <Input
          label="비밀번호"
          type="password"
          value={password}
          placeholder="비밀번호"
          onChange={handlePasswordChange}
          isError={passwordError}
        />
      </div>
      {passwordError && (
        <ErrorWrapper>
          <p>{passwordError}</p>
        </ErrorWrapper>
      )}
      <div className="link-wrapper">
        <SignUpLink to="/signUp">회원가입</SignUpLink>
      </div>
      {error && (
        <ErrorWrapper>
          <p>{error}</p>
        </ErrorWrapper>
      )}
      <Button>로그인</Button>
    </Wrapper>
  );
};

export default LoginForm;
