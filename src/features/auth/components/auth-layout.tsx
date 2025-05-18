import { Button, Card, Divider, Form, Layout, Typography, Spin } from 'antd';
import { AppleIcon, GoogleIcon } from '../../../assets/icons/social-icons';
import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/use-auth';

// Interface mockada. Criar tipagem real
export interface AuthFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
}

type AuthLayoutPropsType<
  T extends AuthFormValues | RegisterFormValues = AuthFormValues
> = {
  readonly children: React.ReactNode;
  readonly title: string;
  readonly subtitle: string;
  readonly formName: string;
  readonly submitText?: string;
  readonly isLoading?: boolean;
  readonly onSubmit?: (values: T) => Promise<void>;
};

export default function AuthLayout<
  T extends AuthFormValues | RegisterFormValues
>({
  children,
  title,
  subtitle,
  formName,
  submitText = 'Entrar',
  isLoading = false,
  onSubmit
}: AuthLayoutPropsType<T>) {
  const [form] = Form.useForm();
  const { isAuthenticated } = useAuth();
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSocialLogin = (provider: string) => {
    setSocialLoading(provider);
    setTimeout(() => {
      console.log(`Login com ${provider}`);
      setSocialLoading(null);
    }, 1000);
  };

  const handleSubmit = (values: T) => {
    if (onSubmit) {
      onSubmit(values);
    } else {
      console.log('Form values:', values);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const renderFormFooterMessage = () => {
    if (formName === 'login') {
      return (
        <p className="text-gray-500">
          Ainda não tem uma conta?{' '}
          <Link
            to="/autenticacao/cadastro"
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Cadastre-se
          </Link>
        </p>
      );
    }

    return (
      <p className="text-gray-500">
        Já possui uma conta?{' '}
        <Link
          to="/autenticacao/login"
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Faça login
        </Link>
      </p>
    );
  };

  return (
    <Layout className="h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-2">
      <Card className="w-full max-w-xl shadow-sm border-0 rounded-xl overflow-hidden p-2! lg:p-4!">
        <header className="mb-8">
          <Typography.Title
            className="mb-2 text-center text-gray-800"
            level={2}
          >
            {title}
          </Typography.Title>
          <Typography.Paragraph className="text-center text-gray-500 mb-0">
            {subtitle}
          </Typography.Paragraph>
        </header>

        <Form
          form={form}
          name={formName}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          {children}

          <div className="flex justify-end">
            <Link
              to="/recuperar-senha"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Esqueceu sua senha?
            </Link>
          </div>

          <Form.Item className="mb-2">
            <Button
              type="primary"
              htmlType="submit"
              className="w-full py-5! rounded-lg text-base font-medium shadow-md hover:shadow-lg transition-all"
              loading={isLoading}
            >
              {submitText}
            </Button>
          </Form.Item>
        </Form>

        <Divider className="my-6">
          <span className="text-gray-400 text-sm px-2">ou continue com</span>
        </Divider>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            size="large"
            icon={
              socialLoading === 'Google' ? (
                <Spin size="small" />
              ) : (
                <GoogleIcon />
              )
            }
            className="flex items-center justify-center gap-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all h-12"
            onClick={() => handleSocialLogin('Google')}
            disabled={!!socialLoading}
          >
            <span className="text-gray-700">Google</span>
          </Button>
          <Button
            size="large"
            icon={
              socialLoading === 'Apple' ? <Spin size="small" /> : <AppleIcon />
            }
            className="flex items-center justify-center gap-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all h-12"
            onClick={() => handleSocialLogin('Apple')}
            disabled={!!socialLoading}
          >
            <span className="text-gray-700">Apple</span>
          </Button>
        </div>

        <div className="flex items-center justify-center mt-6">
          {renderFormFooterMessage()}
        </div>
      </Card>
    </Layout>
  );
}
