import React, { useState } from 'react';
import styled from 'styled-components';
import { Window, WindowHeader, WindowContent, Button, Radio, GroupBox } from 'react95';
import { useDispatch } from 'react-redux';
import { setOnboardingSeen, setEquipment } from '../engine/store';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 20000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div`
  font-family: 'ms_sans_serif';
  line-height: 1.5;
  font-size: 14px;
`;

const Slide = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  color: #000080;
`;

const Warning = styled.div`
  color: #880000;
  border: 1px dashed #880000;
  padding: 10px;
  margin-top: 10px;
  background: #ffcccc;
`;

const AsciiArt = styled.pre`
  font-family: 'DosVga', monospace;
  font-size: 12px;
  text-align: center;
  margin: 10px 0;
  color: #0000AA;
`;

const START_PC_OPTS = [
    { value: '286 AT', label: '286 AT (Старое корыто)' },
    { value: '386 DX-40', label: '386 DX-40 (Золотая середина)' },
    { value: '486 SX-25', label: '486 SX-25 (Для мажоров)' }
];

const START_MODEM_OPTS = [
    { value: 'No-name 2400', label: 'No-name 2400 (Глючит, но дешево)' },
    { value: 'Acorp 9600', label: 'Acorp 9600 (Внешний)' }
];

const STEPS = [
    {
        title: "Добро пожаловать в 1995 год",
        content: (
            <div>
                <AsciiArt>
{`
   ._________________.
   |.---------------.|
   ||               ||
   ||   FidoNet     ||
   ||   Simulator   ||
   ||_______________||
   /.-.-.-.-.-.-.-.-.\\
  /.-.-.-.-.-.-.-.-.-.\\
 /_____________________\\
 \\_____________________/
`}
                </AsciiArt>
                <p>Ты — обычный студент, живущий в постсоветском спальном районе.</p>
                <p>Твоя комната завалена железом, а в углу гудит компьютер, собранный из того, что удалось найти.</p>
                <p>Твоя цель — стать <b>Координатором Fidonet</b>, легендарной любительской компьютерной сети, соединяющей людей через телефонные линии.</p>
            </div>
        )
    },
    {
        title: "Твое Железо",
        type: 'setup',
        content: null // Rendered separately
    },
    {
        title: "Твои ресурсы",
        content: (
            <div>
                <p>Чтобы выжить и преуспеть, следи за показателями:</p>
                <ul style={{ listStyle: 'disc', paddingLeft: 20, marginTop: 10 }}>
                    <li><b>Рассудок (Sanity):</b> Падает от троллинга, вирусов и обрывов связи. Если упадет до 0 — Game Over.</li>
                    <li><b>Атмосфера:</b> Отношения с родителями. Не шуми ночью (ZMH) и не занимай телефон слишком долго, иначе тебе перережут провод.</li>
                    <li><b>Деньги:</b> Нужны для оплаты счетов за телефон и покупки крутого железа на радиорынке.</li>
                </ul>
            </div>
        )
    },
    {
        title: "Как играть",
        content: (
            <div>
                <p>Всё взаимодействие происходит через <b>Терминал</b> (MS-DOS Prompt) и программы на рабочем столе.</p>
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                    <li>⌨️ <b>Команды:</b> HELP, DIR, CD, ATZ (инициализация модема)</li>
                    <li>☎️ <b>Связь:</b> DIAL (звонок на BBS)</li>
                    <li>💾 <b>Софт:</b> Качай T-Mail и GoldED, чтобы читать почту</li>
                </ul>
                <br/>
                <Warning>
                    <b>ВАЖНО:</b> Каждую неделю приходит счет за телефон. Используй команду <b>PAY</b>, чтобы оплатить его, или заработай денег командой <b>WORK</b>.
                </Warning>
            </div>
        )
    }
];

function Onboarding() {
    const dispatch = useDispatch();
    const [step, setStep] = useState(0);
    
    // Hardware state local
    const [pc, setPc] = useState('386 DX-40');
    const [modem, setModem] = useState('No-name 2400');

    const handleNext = () => {
        if (step === 1) {
            // Save hardware choices
            dispatch(setEquipment({ type: 'pc', value: pc }));
            dispatch(setEquipment({ type: 'modem', value: modem }));
        }

        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            dispatch(setOnboardingSeen());
        }
    };

    const currentStep = STEPS[step];

    const renderSetup = () => (
        <div>
            <p>Выбери конфигурацию своего первого ПК:</p>
            <GroupBox label="Компьютер (CPU)">
                {START_PC_OPTS.map(opt => (
                    <Radio
                        key={opt.value}
                        checked={pc === opt.value}
                        onChange={() => setPc(opt.value)}
                        value={opt.value}
                        label={opt.label}
                        name="pc"
                    />
                ))}
            </GroupBox>
            <br/>
            <GroupBox label="Модем">
                {START_MODEM_OPTS.map(opt => (
                    <Radio
                        key={opt.value}
                        checked={modem === opt.value}
                        onChange={() => setModem(opt.value)}
                        value={opt.value}
                        label={opt.label}
                        name="modem"
                    />
                ))}
            </GroupBox>
            <p style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
                * Выбор влияет на стартовые характеристики и уважение сисопов.
            </p>
        </div>
    );

    return (
        <Overlay>
            <Window style={{ width: 550, height: 500, display: 'flex', flexDirection: 'column' }}>
                <WindowHeader className="window-header">
                    <span>FidoNet Simulator 1995 - Setup</span>
                </WindowHeader>
                <WindowContent style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
                    <Slide>
                        <Content style={{ flex: 1 }}>
                            <Title>{currentStep.title}</Title>
                            {currentStep.type === 'setup' ? renderSetup() : currentStep.content}
                        </Content>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 }}>
                            <div style={{ fontSize: 12, color: '#888' }}>
                                Шаг {step + 1} из {STEPS.length}
                            </div>
                            <Button onClick={handleNext} size="lg" style={{ fontWeight: 'bold' }}>
                                {step < STEPS.length - 1 ? 'Далее >>' : 'В СЕТЬ!'}
                            </Button>
                        </div>
                    </Slide>
                </WindowContent>
            </Window>
        </Overlay>
    );
}

export default Onboarding;