import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Input, Select, Empty, Spin } from 'antd';
import { Search, Filter } from 'lucide-react';
import type { Questionnaire } from '../interfaces/questionnaire';
import EnhancedQuestionnaireCard from './questionnaire-card';
import type { MessageInstance } from 'antd/es/message/interface';

const { Option } = Select;

interface QuestionnaireGridProps {
  questionnaires: Questionnaire[];
  userRole?: 'student' | 'teacher' | 'admin';
  isLoading?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onRefresh?: () => void;
  messageApi?: MessageInstance;
}

const QuestionnaireGrid = ({
  questionnaires,
  userRole = 'student',
  isLoading = false,
  onEdit,
  onDelete,
  onRefresh,
  messageApi
}: QuestionnaireGridProps) => {
  const [searchText, setSearchText] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string | undefined>(
    undefined
  );
  const [filteredQuestionnaires, setFilteredQuestionnaires] = useState<
    Questionnaire[]
  >([]);

  const themes = Array.from(new Set(questionnaires.map((q) => q.theme))).sort();

  useEffect(() => {
    let filtered = questionnaires;

    if (searchText) {
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(searchText.toLowerCase()) ||
          q.description.toLowerCase().includes(searchText.toLowerCase()) ||
          q.theme.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedTheme) {
      filtered = filtered.filter((q) => q.theme === selectedTheme);
    }

    setFilteredQuestionnaires(filtered);
  }, [questionnaires, searchText, selectedTheme]);

  const handleDelete = useCallback(
    (deletedId: number) => {
      setFilteredQuestionnaires((prev) =>
        prev.filter((q) => q.id !== deletedId)
      );
      onDelete?.(deletedId);
      onRefresh?.();
    },
    [onDelete, onRefresh]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Filtros */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Input
          placeholder="Buscar questionários..."
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          className="w-full sm:max-w-md h-10 sm:h-auto"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <Select
          placeholder="Filtrar por tema"
          className="w-full sm:w-48"
          allowClear
          value={selectedTheme}
          onChange={setSelectedTheme}
          suffixIcon={<Filter className="w-4 h-4 text-gray-400" />}
        >
          {themes.map((theme) => (
            <Option key={theme} value={theme}>
              {theme}
            </Option>
          ))}
        </Select>
      </div>

      {/* Grid de questionários */}
      {filteredQuestionnaires.length > 0 ? (
        <Row gutter={[12, 12]} className="sm:gutter-16">
          {filteredQuestionnaires.map((questionnaire) => (
            <Col key={questionnaire.id} xs={24} sm={12} md={8} lg={6} xl={6}>
              <EnhancedQuestionnaireCard
                questionnaire={questionnaire}
                userRole={userRole}
                onEdit={onEdit}
                onDelete={handleDelete}
                messageApi={messageApi}
                refetch={onRefresh}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          description={
            <span className="text-sm sm:text-base">
              {searchText || selectedTheme
                ? 'Nenhum questionário encontrado para os filtros aplicados'
                : 'Nenhum questionário disponível'}
            </span>
          }
          className="my-8"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );
};

export default QuestionnaireGrid;
