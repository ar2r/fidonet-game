import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Window, WindowHeader, WindowContent } from 'react95';

const TuiContainer = styled.div`
  background-color: #0000AA; /* DOS Blue */
  color: #FFFFFF;
  font-family: 'Terminus', 'Courier New', monospace;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const MenuBar = styled.div`
  background-color: #AAAAAA;
  color: #000;
  padding: 2px 10px;
  font-weight: bold;
`;

const WorkArea = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #0000AA;
`;

const FormRow = styled.div`
  display: flex;
  margin-bottom: 12px;
  align-items: center;
`;

const Label = styled.div`
  width: 180px;
  color: ${props => props.focused ? '#FFFF00' : '#FFFFFF'};
  font-weight: ${props => props.focused ? 'bold' : 'normal'};
`;

const InputField = styled.input`
  background-color: ${props => props.focused ? '#FFFFFF' : '#CCCCCC'};
  color: ${props => props.focused ? '#000000' : '#333333'};
  border: 2px solid ${props => props.focused ? '#FFFF00' : '#888888'};
  padding: 4px 8px;
  font-family: 'Terminus', 'Courier New', monospace;
  font-size: 14px;
  width: 350px;
  outline: none;

  &:disabled {
    background-color: #888888;
    color: #CCCCCC;
  }
`;

const ValidationMessage = styled.div`
  color: #FF5555;
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #FF5555;
  background-color: rgba(255, 85, 85, 0.1);
`;

const SuccessMessage = styled.div`
  color: #55FF55;
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #55FF55;
  background-color: rgba(85, 255, 85, 0.1);
`;

const StatusBar = styled.div`
  background-color: #AAAAAA;
  color: #000;
  padding: 2px 10px;
  display: flex;
  gap: 20px;
`;

const HintText = styled.div`
  color: #AAAAAA;
  margin-top: 20px;
  padding: 10px;
  font-size: 12px;
  line-height: 1.4;
`;

const FIELDS = [
  { key: 'address', label: 'FidoNet Address:', placeholder: 'Z:NNNN/NNN.PP (например: 2:5020/123.45)' },
  { key: 'password', label: 'Session Password:', placeholder: 'Пароль для линка' },
  { key: 'bossAddress', label: 'Boss Node Address:', placeholder: 'Z:NNNN/NNN (например: 2:5020/123)' },
  { key: 'bossPhone', label: 'Boss Node Phone:', placeholder: 'Телефон босс-ноды' },
  { key: 'inbound', label: 'Inbound Directory:', placeholder: 'C:\\FIDO\\INBOUND' },
  { key: 'outbound', label: 'Outbound Directory:', placeholder: 'C:\\FIDO\\OUTBOUND' },
];

function ConfigEditor({ onClose, onSave, initialConfig = {} }) {
  const [config, setConfig] = useState({
    address: initialConfig.address || '',
    password: initialConfig.password || '',
    bossAddress: initialConfig.bossAddress || '',
    bossPhone: initialConfig.bossPhone || '',
    inbound: initialConfig.inbound || 'C:\\FIDO\\INBOUND',
    outbound: initialConfig.outbound || 'C:\\FIDO\\OUTBOUND',
  });

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [validationError, setValidationError] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    // Basic validation
    if (!config.address.trim()) {
      setValidationError('ОШИБКА: Не указан FidoNet адрес');
      return;
    }
    if (!config.password.trim()) {
      setValidationError('ОШИБКА: Не указан пароль');
      return;
    }
    if (!config.bossAddress.trim()) {
      setValidationError('ОШИБКА: Не указан адрес босс-ноды');
      return;
    }
    if (!config.bossPhone.trim()) {
      setValidationError('ОШИБКА: Не указан телефон босс-ноды');
      return;
    }

    // Call onSave callback with config
    if (onSave) {
      const result = onSave(config);
      if (result && result.error) {
        setValidationError(result.error);
        return;
      }
    }

    setSaved(true);
    setValidationError(null);

    // Auto-close after 1.5 seconds
    setTimeout(() => {
      onClose();
    }, 1500);
  }, [config, onSave, onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      setFocusedIndex(prev => (prev + 1) % FIELDS.length);
      setValidationError(null);
      setSaved(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      setFocusedIndex(prev => (prev + 1) % FIELDS.length);
      setValidationError(null);
      setSaved(false);
    } else if (e.key === 'F2') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [handleSave, onClose]);

  const handleFieldChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setValidationError(null);
    setSaved(false);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Window style={{ width: 700, height: 500, position: 'absolute', top: '10%', left: '15%', zIndex: 1000 }}>
      <WindowHeader>T-Mail Configuration Editor v2605</WindowHeader>
      <WindowContent style={{ padding: 0, height: '100%' }}>
        <TuiContainer>
          <MenuBar>
            T-MAIL.CTL — Редактирование конфигурации
          </MenuBar>
          <WorkArea>
            {FIELDS.map((field, index) => (
              <FormRow key={field.key}>
                <Label focused={focusedIndex === index}>
                  {field.label}
                </Label>
                <InputField
                  type="text"
                  value={config[field.key]}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  focused={focusedIndex === index}
                  disabled={saved}
                />
              </FormRow>
            ))}

            {validationError && (
              <ValidationMessage>{validationError}</ValidationMessage>
            )}

            {saved && (
              <SuccessMessage>
                ✓ Конфигурация сохранена в C:\FIDO\T-MAIL.CTL
              </SuccessMessage>
            )}

            <HintText>
              Подсказка: Узнайте ваш адрес и пароль у Сисопа BBS.<br/>
              Прочитайте файл README.1ST для дополнительной информации.
            </HintText>
          </WorkArea>
          <StatusBar>
            <span>Tab/Enter - Следующее поле</span>
            <span>F2 - Сохранить</span>
            <span>ESC - Выход</span>
          </StatusBar>
        </TuiContainer>
      </WindowContent>
    </Window>
  );
}

export default ConfigEditor;
