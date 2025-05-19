import { Form, Input } from 'antd';
import { useEffect } from 'react';
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  MailOutlined
} from '@ant-design/icons';
import AuthLayout, { type AuthFormValues } from '../components/auth-layout';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../hooks/use-auth';

export default function Login() {
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (values: AuthFormValues) => {
    await login({
      email: values.email,
      password: values.password
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      const lastPath = sessionStorage.getItem('lastPath');
      const locationState = location.state as {
        from?: { pathname: string };
      } | null;
      const returnUrl = locationState?.from?.pathname || lastPath || '/';

      sessionStorage.removeItem('lastPath');
      navigate(returnUrl);
    }
  }, [isAuthenticated, navigate, location]);

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Faça login para acessar sua conta"
      formName="login"
      submitText="Entrar"
      isLoading={isLoading}
      onSubmit={handleLogin}
    >
      <Form.Item
        label="E-mail"
        name="email"
        rules={[
          { required: true, message: 'Por favor, informe seu e-mail' },
          { type: 'email', message: 'E-mail inválido' }
        ]}
      >
        <Input
          prefix={<MailOutlined className="text-gray-400 mr-2" />}
          placeholder="seu@email.com"
          size="large"
          className="rounded-lg py-3!"
        />
      </Form.Item>

      <Form.Item
        label="Senha"
        name="password"
        rules={[
          { required: true, message: 'Por favor, informe sua senha' },
          { min: 6, message: 'A senha deve ter pelo menos 6 caracteres' }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="text-gray-400 mr-2" />}
          placeholder="Sua senha"
          size="large"
          className="rounded-lg py-3!"
          iconRender={(visible) =>
            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
          }
        />
      </Form.Item>
    </AuthLayout>
  );
}
