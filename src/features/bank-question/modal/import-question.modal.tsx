import {
  Button,
  Modal,
  Upload,
  Alert,
  Progress,
  Table,
  Typography,
  Space,
  Divider,
  Card
} from 'antd';
import { useState, useCallback } from 'react';
import {
  InboxOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useLayoutLoading } from '../../../shared/hooks/use-layout';
import type { MessageInstance } from 'antd/es/message/interface';
import type { ImportResultDto } from '../dto/import-result.dto';
import { bankQuestionImportService } from '../services/bank-question-import.service';

const { Dragger } = Upload;
const { Title, Text, Paragraph } = Typography;

type ImportQuestionsModalProps = {
  visible: boolean;
  onClose: () => void;
  messageApi: MessageInstance;
  refetch?: () => void;
};

const ImportQuestionsModal = ({
  visible,
  onClose,
  messageApi,
  refetch
}: ImportQuestionsModalProps) => {
  const { isLoading, setLoading } = useLayoutLoading();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResultDto | null>(
    null
  );
  const [step, setStep] = useState<'upload' | 'result'>('upload');

  const handleClose = useCallback(() => {
    setSelectedFile(null);
    setImportResult(null);
    setStep('upload');
    onClose();
  }, [onClose]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.csv',
    beforeUpload: (file) => {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        messageApi.error('Por favor, selecione apenas arquivos CSV');
        return false;
      }

      if (file.size > 100 * 1024 * 1024) {
        messageApi.error('O arquivo deve ter no máximo 100MB');
        return false;
      }

      setSelectedFile(file);
      return false;
    },
    onRemove: () => {
      setSelectedFile(null);
    },
    fileList: selectedFile
      ? [
          {
            uid: '1',
            name: selectedFile.name,
            status: 'done',
            size: selectedFile.size
          }
        ]
      : []
  };

  const handleImport = useCallback(async () => {
    if (!selectedFile) {
      messageApi.error('Por favor, selecione um arquivo CSV');
      return;
    }

    try {
      setLoading(true);
      const result = await bankQuestionImportService.importQuestions(
        selectedFile
      );

      setImportResult(result);
      setStep('result');

      if (result.successful > 0) {
        refetch?.();
        messageApi.success(
          `${result.successful} questões importadas com sucesso!`
        );
      }

      if (result.failed > 0) {
        messageApi.warning(`${result.failed} questões falharam na importação`);
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      messageApi.error(
        'Erro ao importar questões. Verifique o formato do arquivo.'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedFile, setLoading, messageApi, refetch]);

  const downloadTemplate = () => {
    const csvContent = `type,theme,difficulty,content,option1,option2,option3,option4,option5,correct,correct1,correct2,correct3
single,Programação,easy,Qual linguagem é conhecida como a linguagem da web?,JavaScript,Python,C++,Ruby,PHP,1
single,Programação,hard,Qual destes não é um paradigma de programação?,Funcional,Procedural,Orientado a Objetos,Linear,Lógico,4`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template-questoes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const errorColumns = [
    {
      title: 'Linha',
      dataIndex: 'position',
      key: 'position',
      width: 80
    },
    {
      title: 'Erro',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true
    },
    {
      title: 'Dados',
      dataIndex: 'rawData',
      key: 'rawData',
      ellipsis: true,
      render: (text: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {text?.substring(0, 100)}...
        </Text>
      )
    }
  ];

  const renderUploadStep = () => (
    <div>
      <div className="mb-6">
        <Alert
          message="Formato do arquivo CSV"
          description={
            <div>
              <Paragraph>
                O arquivo deve conter as seguintes colunas obrigatórias:
              </Paragraph>
              <ul className="list-disc list-inside text-sm">
                <li>
                  <strong>type:</strong> SINGLE, MULTIPLE ou ESSAY
                </li>
                <li>
                  <strong>theme:</strong> Tema da questão
                </li>
                <li>
                  <strong>difficulty:</strong> EASY, MEDIUM ou HARD
                </li>
                <li>
                  <strong>content:</strong> Conteúdo/enunciado da questão
                </li>
                <li>
                  <strong>option1, option2, etc.:</strong> Alternativas (para
                  questões não dissertativas)
                </li>
                <li>
                  <strong>correct1, correct2, etc.:</strong> true/false para
                  indicar alternativas corretas
                </li>
              </ul>
              <div className="mt-3">
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={downloadTemplate}
                  className="p-0"
                >
                  Baixar template de exemplo
                </Button>
              </div>
            </div>
          }
          type="info"
          showIcon
        />
      </div>

      <Dragger {...uploadProps} className="mb-4">
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Clique ou arraste o arquivo CSV para esta área
        </p>
        <p className="ant-upload-hint">
          Suporte apenas para arquivos .csv (máximo 100MB)
        </p>
      </Dragger>
    </div>
  );

  const renderResultStep = () => {
    if (!importResult) return null;

    const successRate =
      importResult.total > 0
        ? (importResult.successful / importResult.total) * 100
        : 0;

    return (
      <div>
        <Card className="mb-4">
          <div className="text-center">
            <Title level={4}>Resultado da Importação</Title>

            <div className="mb-4">
              <Progress
                type="circle"
                percent={Math.round(successRate)}
                format={() =>
                  `${importResult.successful}/${importResult.total}`
                }
                status={importResult.failed > 0 ? 'exception' : 'success'}
              />
            </div>

            <Space size="large">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {importResult.successful}
                </div>
                <div className="text-sm text-gray-500">Sucessos</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {importResult.failed}
                </div>
                <div className="text-sm text-gray-500">Falhas</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {importResult.total}
                </div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </Space>
          </div>
        </Card>

        {importResult.errors.length > 0 && (
          <div>
            <Divider orientation="left">
              <Space>
                <CloseCircleOutlined className="text-red-500" />
                Erros Encontrados ({importResult.errors.length})
              </Space>
            </Divider>

            <Table
              dataSource={importResult.errors}
              columns={errorColumns}
              pagination={{ pageSize: 5 }}
              size="small"
              rowKey="position"
              scroll={{ x: true }}
            />
          </div>
        )}

        {importResult.successful > 0 && (
          <Alert
            message="Importação concluída com sucesso!"
            description={`${importResult.successful} questões foram adicionadas ao banco de questões.`}
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            className="mt-4"
          />
        )}
      </div>
    );
  };

  return (
    <Modal
      centered
      open={visible}
      onCancel={handleClose}
      title="Importar Questões via CSV"
      width={800}
      footer={
        step === 'upload'
          ? [
              <Button key="cancel" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>,
              <Button
                key="template"
                onClick={downloadTemplate}
                disabled={isLoading}
              >
                <DownloadOutlined /> Template
              </Button>,
              <Button
                key="import"
                type="primary"
                onClick={handleImport}
                disabled={!selectedFile || isLoading}
                loading={isLoading}
              >
                Importar Questões
              </Button>
            ]
          : [
              <Button
                key="new"
                onClick={() => setStep('upload')}
                disabled={isLoading}
              >
                Nova Importação
              </Button>,
              <Button key="close" type="primary" onClick={handleClose}>
                Fechar
              </Button>
            ]
      }
    >
      {step === 'upload' ? renderUploadStep() : renderResultStep()}
    </Modal>
  );
};

export default ImportQuestionsModal;
