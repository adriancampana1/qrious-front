import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode
} from 'react';
import { AuthContext, authReducer, initialState } from './auth.context';
import type { LoginCredentials, RegisterData } from '../types/auth.types';
import { authApi } from '../api/auth.api';
import { message } from 'antd';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');

    if (storedUser && storedToken) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: JSON.parse(storedUser), accessToken: storedToken }
      });
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        dispatch({ type: 'LOGIN_START' });
        const response = await authApi.login(credentials);

        localStorage.setItem('accessToken', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.user,
            accessToken: response.access_token
          }
        });

        messageApi.success('Login realizado com sucesso!');
      } catch (error) {
        dispatch({ type: 'LOGIN_FAILURE' });
        messageApi.error(
          error instanceof Error ? error.message : 'Falha ao realizar login'
        );
      }
    },
    [messageApi]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        dispatch({ type: 'REGISTER_START' });
        const response = await authApi.register(data);

        localStorage.setItem('accessToken', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));

        dispatch({
          type: 'REGISTER_SUCCESS',
          payload: {
            user: response.user,
            accessToken: response.access_token
          }
        });

        messageApi.success('Cadastro realizado com sucesso!');
      } catch (error) {
        dispatch({ type: 'REGISTER_FAILURE' });
        messageApi.error(
          error instanceof Error ? error.message : 'Falha ao realizar cadastro'
        );
      }
    },
    [messageApi]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    dispatch({ type: 'LOGOUT' });
    messageApi.success('Logout realizado com sucesso!');
  }, [messageApi]);

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout
    }),
    [login, logout, register, state]
  );

  return (
    <AuthContext.Provider value={value}>
      {contextHolder}
      {children}
    </AuthContext.Provider>
  );
};
