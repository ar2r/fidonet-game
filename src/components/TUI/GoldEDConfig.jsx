import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const TuiContainer = styled.div`
  background-color: #0000AA; /* DOS Blue */
  color: #FFFFFF;
  font-family: 'DosVga', 'VT323', monospace;
  font-size: 20px;
  line-height: 1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
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
  font-family: 'DosVga', 'VT323', monospace;
  font-size: 18px;
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
  { key: 'username', label: 'User Name:', placeholder: 'Ваше имя в сети (например: Vasya Pupkin)' },
  { key: 'realname', label: 'Real Name:', placeholder: 'Ваше настоящее имя' },
  { key: 'address', label: 'FidoNet Address:', placeholder: 'Тот же адрес, что и в T-Mail' },
  { key: 'origin', label: 'Origin:', placeholder: 'Подпись в конце писем (например: Moscow, Russia)' },
];

function GoldEDConfig({ onClose, onSave, initialConfig = {}, tmailAddress = '', windowId = 'golded-config' }) {
  const activeWindow = useSelector(state => state.windowManager.activeWindow);

  const [config, setConfig] = useState({
    username: initialConfig.username || '',
    realname: initialConfig.realname || '',
    address: initialConfig.address || tmailAddress,
    origin: initialConfig.origin || '',
  });

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [validationError, setValidationError] = useState(null);
  const [saved, setSaved] = useState(false);

  // Refs для полей ввода
  const inputRefs = useRef([]);

  // Устанавливаем фокус на активное поле при изменении focusedIndex
  useEffect(() => {
    if (inputRefs.current[focusedIndex] && !saved) {
      inputRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex, saved]);

  const handleSave = useCallback(() => {
    // Basic validation
    if (!config.username.trim()) {
      setValidationError('ОШИБКА: Не указано имя пользователя');
      return;
    }
    if (!config.address.trim()) {
      setValidationError('ОШИБКА: Не указан FidoNet адрес');
      return;
    }

    // Check if address matches T-Mail config
    if (tmailAddress && config.address !== tmailAddress) {
      setValidationError('ПРЕДУПРЕЖДЕНИЕ: Адрес не совпадает с T-Mail конфигом.\nРекомендуется использовать тот же адрес.');
      // Allow to continue anyway
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
  }, [config, onSave, onClose, tmailAddress]);

  const handleKeyDown = useCallback((e) => {
    // Проверяем, что это окно активно
    if (activeWindow !== windowId) return;

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
  }, [handleSave, onClose, activeWindow, windowId]);

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
    <TuiContainer>
          <MenuBar>
            GOLDED.CFG — Редактирование конфигурации
          </MenuBar>
          <WorkArea>
            {FIELDS.map((field, index) => (
              <FormRow key={field.key}>
                <Label focused={focusedIndex === index}>
                  {field.label}
                </Label>
                <InputField
                  ref={el => inputRefs.current[index] = el}
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
                ✓ Конфигурация сохранена в C:\FIDO\GOLDED.CFG
              </SuccessMessage>
            )}

            <HintText>
              Подсказка: Используйте тот же FidoNet адрес, что и в T-Mail.<br/>
              Origin — это подпись, которая появится в конце ваших писем.
            </HintText>
          </WorkArea>
          <StatusBar>
            <span>Tab/Enter - Следующее поле</span>
            <span>F2 - Сохранить</span>
            <span>ESC - Выход</span>
          </StatusBar>
        </TuiContainer>
  );
}

export default GoldEDConfig;
