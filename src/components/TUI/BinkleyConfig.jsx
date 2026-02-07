import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

const TuiContainer = styled.div`
  background-color: #0000AA;
  color: #FFFFFF;
  font-family: 'DosVga', monospace;
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
  font-family: 'DosVga', monospace;
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
  { key: 'sysopName', label: 'SysOp Name:', placeholder: 'Ваше имя (как SysOp)' },
  { key: 'address', label: 'Main Address:', placeholder: 'Z:NNNN/NNN.PP (2:5020/730)' },
  { key: 'baudRate', label: 'Port Speed:', placeholder: '19200' },
  { key: 'port', label: 'COM Port:', placeholder: 'COM1 or COM2' },
  { key: 'inbound', label: 'Inbound Dir:', placeholder: 'C:\FIDO\INBOUND' },
  { key: 'outbound', label: 'Outbound Dir:', placeholder: 'C:\FIDO\OUTBOUND' },
];

function BinkleyConfig({ onClose, onSave, initialConfig = {} }) {
  const [config, setConfig] = useState({
    sysopName: initialConfig.sysopName || '',
    address: initialConfig.address || '',
    baudRate: initialConfig.baudRate || '',
    port: initialConfig.port || 'COM1',
    inbound: initialConfig.inbound || 'C:\FIDO\INBOUND',
    outbound: initialConfig.outbound || 'C:\FIDO\OUTBOUND',
  });

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [validationError, setValidationError] = useState(null);
  const [saved, setSaved] = useState(false);

  // Focus ref for keyboard navigation
  const handleSave = useCallback(() => {
    // Basic validation
    if (!config.sysopName.trim()) {
      setValidationError('ОШИБКА: Не указано имя Сисопа');
      return;
    }
    if (!config.address.trim()) {
      setValidationError('ОШИБКА: Не указан адрес');
      return;
    }
    if (!config.baudRate.trim()) {
      setValidationError('ОШИБКА: Не указана скорость порта');
      return;
    }

    // Call onSave callback
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
      // onClose handled by parent usually?
      if (onClose) onClose();
    }, 1500);
  }, [config, onSave, onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab' || e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev + 1) % FIELDS.length);
      setValidationError(null);
      setSaved(false);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + FIELDS.length) % FIELDS.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // If on last field, maybe save? Or just next field
      setFocusedIndex(prev => (prev + 1) % FIELDS.length);
    } else if (e.key === 'F2') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (onClose) onClose();
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
    <TuiContainer>
          <MenuBar>
            BT.CFG — BinkleyTerm 2.60 Setup
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
                  ref={el => {
                      if (el && focusedIndex === index) {
                          el.focus();
                      }
                  }}
                />
              </FormRow>
            ))}

            {validationError && (
              <ValidationMessage>{validationError}</ValidationMessage>
            )}

            {saved && (
              <SuccessMessage>
                ✓ Конфигурация сохранена в C:\FIDO\BT.CFG
              </SuccessMessage>
            )}

            <HintText>
              Настройки Ноды должны соответствовать требованиям Сисопа.<br/>
              Скорость порта для US Robotics Courier: 19200 или 38400.
            </HintText>
          </WorkArea>
          <StatusBar>
            <span>Tab/Arrows - Навигация</span>
            <span>F2 - Сохранить</span>
            <span>ESC - Выход</span>
          </StatusBar>
        </TuiContainer>
  );
}

export default BinkleyConfig;
