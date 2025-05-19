import { Form, Input } from 'antd';
import { useEffect } from 'react';
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  MailOutlined,
  UserOutlined
} from '@ant-design/icons';
import AuthLayout, { type RegisterFormValues } from '../components/auth-layout';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/use-auth';

export default function Register() {
  const { login, register, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (values: RegisterFormValues) => {
    await register({
      email: values.email,
      name: values.name,
      password: values.password
    });
    await login({
      email: values.email,
      password: values.password
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Realize seu cadastro para acessar a plataforma"
      formName="register"
      submitText="Cadastrar"
      isLoading={isLoading}
      onSubmit={handleRegister}
    >
      <Form.Item
        label="Nome do usuário"
        name="name"
        rules={[{ required: true, message: 'Por favor, informe seu nome' }]}
      >
        <Input
          prefix={<UserOutlined className="text-gray-400 mr-2" />}
          placeholder="Nome"
          size="large"
          className="rounded-lg py-3!"
        />
      </Form.Item>

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
          { min: 8, message: 'A senha deve ter pelo menos 8 caracteres' },
          {
            pattern: /[A-Z]/,
            message: 'A senha deve conter pelo menos uma letra maiúscula'
          },
          {
            pattern: /[a-z]/,
            message: 'A senha deve conter pelo menos uma letra minúscula'
          },
          {
            pattern: /[0-9]/,
            message: 'A senha deve conter pelo menos um número'
          }
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

      <Form.Item
        label="Confirme sua senha"
        name="password"
        rules={[
          { required: true, message: 'Por favor, informe sua senha' },
          { min: 8, message: 'A senha deve ter pelo menos 8 caracteres' },
          {
            pattern: /[A-Z]/,
            message: 'A senha deve conter pelo menos uma letra maiúscula'
          },
          {
            pattern: /[a-z]/,
            message: 'A senha deve conter pelo menos uma letra minúscula'
          },
          {
            pattern: /[0-9]/,
            message: 'A senha deve conter pelo menos um número'
          }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="text-gray-400 mr-2" />}
          placeholder="Digite a senha novamente"
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
