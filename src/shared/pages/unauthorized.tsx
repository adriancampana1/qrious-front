import React from 'react';
import { Button, Typography } from 'antd';
import { ArrowLeft, ShieldOff } from 'lucide-react';
import { useNavigate } from 'react-router';

const { Title, Paragraph } = Typography;

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <div className="text-center max-w-2xl mx-auto">
        <ShieldOff className="w-20 h-20 text-red-500 mx-auto mb-4" />

        <Title level={3} className="mb-2 font-medium">
          Acesso Não Autorizado
        </Title>

        <Paragraph className="text-gray-500 mb-8">
          Você não possui permissão para acessar esta página. Por favor,
          verifique suas credenciais ou entre em contato com o administrador do
          sistema.
        </Paragraph>

        <Button
          type="primary"
          size="large"
          icon={<ArrowLeft className="w-4 h-4 mr-2" />}
          onClick={handleGoHome}
          className="flex items-center justify-center h-10 bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-sm px-6 mx-auto"
        >
          Voltar para a Página Inicial
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
