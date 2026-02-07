import React, { useState } from 'react';
import styled from 'styled-components';
import { Window, WindowHeader, WindowContent, Button } from 'react95';
import { useDispatch } from 'react-redux';
import { setOnboardingSeen } from '../engine/store';

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
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

const STEPS = [
    {
        title: "Добро пожаловать в 1995 год",
        content: (
            <div>
                <p>Ты — обычный студент, живущий в постсоветском спальном районе.</p>
                <p>Твоя комната завалена железом, а в углу гудит старенький 386-й компьютер.</p>
                <p>Твоя цель — стать <b>Координатором Фидонета</b>, легендарной любительской компьютерной сети.</p>
            </div>
        )
    },
    {
        title: "Твои ресурсы",
        content: (
            <div>
                <p>Чтобы выжить и преуспеть, следи за показателями:</p>
                <ul style={{ listStyle: 'disc', paddingLeft: 20, marginTop: 10 }}>
                    <li><b>Рассудок (Sanity):</b> Падает от троллинга и глюков. Если упадет до 0 — Game Over.</li>
                    <li><b>Атмосфера:</b> Твои отношения с родителями. Не шуми ночью (ZMH), иначе отключат линию.</li>
                    <li><b>Деньги:</b> Нужны для оплаты телефона и апгрейда железа. Работай или экономь.</li>
                </ul>
            </div>
        )
    },
    {
        title: "Геймплей",
        content: (
            <div>
                <p>Всё взаимодействие происходит через <b>Терминал</b> (Fido.bat) и программы на рабочем столе.</p>
                <p>— Вводи команды (HELP, DIR, CD, ATZ)</p>
                <p>— Звони на BBS (DIAL)</p>
                <p>— Качай софт и читай почту</p>
                <br/>
                <Warning>
                    Внимание! Не забывай оплачивать счета за телефон командой PAY. Иначе отключат линию!
                </Warning>
            </div>
        )
    }
];

function Onboarding() {
    const dispatch = useDispatch();
    const [step, setStep] = useState(0);

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            dispatch(setOnboardingSeen());
        }
    };

    const currentStep = STEPS[step];

    return (
        <Overlay>
            <Window style={{ width: 500 }}>
                <WindowHeader className="window-header">
                    <span>FidoNet Simulator 1995 - Introduction</span>
                </WindowHeader>
                <WindowContent>
                    <Slide>
                        <Content>
                            <Title>{currentStep.title}</Title>
                            {currentStep.content}
                        </Content>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                            <Button onClick={handleNext} size="lg" style={{ fontWeight: 'bold' }}>
                                {step < STEPS.length - 1 ? 'Далее >>' : 'Начать игру!'}
                            </Button>
                        </div>
                    </Slide>
                    <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: '#888' }}>
                        Шаг {step + 1} из {STEPS.length}
                    </div>
                </WindowContent>
            </Window>
        </Overlay>
    );
}

export default Onboarding;
