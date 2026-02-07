import React from 'react';
import styled from 'styled-components';

const MapContainer = styled.div`
  background-color: #F0F0F0;
  color: #000;
  font-family: 'ms_sans_serif', sans-serif;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background-color: #000080;
  color: #FFF;
  padding: 8px;
  font-weight: bold;
  text-align: center;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ActBlock = styled.div`
  border: 2px solid #808080;
  background: #FFF;
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
  padding: 10px;
  box-shadow: 4px 4px 0px rgba(0,0,0,0.2);
`;

const ActTitle = styled.h3`
  margin: 0 0 10px 0;
  border-bottom: 1px solid #000;
  padding-bottom: 5px;
  color: #000080;
`;

const NodeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NodeItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 5px;
  background: ${props => props.active ? '#e6f2ff' : 'transparent'};
  border: ${props => props.active ? '1px dotted #000080' : 'none'};
`;

const NodeIcon = styled.div`
  width: 24px;
  height: 24px;
  background: ${props => props.color || '#ccc'};
  border: 1px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  flex-shrink: 0;
`;

const NodeInfo = styled.div`
  flex: 1;
`;

const NodeTitle = styled.div`
  font-weight: bold;
  font-size: 14px;
`;

const NodeDesc = styled.div`
  font-size: 12px;
  color: #444;
`;

const GAME_PATH = [
    {
        act: 'Акт 1: Коннект',
        nodes: [
            { id: 'N1', title: 'Дом (Home)', desc: 'Стартовая точка. Покупка модема.', color: '#4CAF50' },
            { id: 'N2', title: 'BBS "The Nexus"', desc: 'Первый звонок. Скачивание софта.', color: '#2196F3' }
        ]
    },
    {
        act: 'Акт 2: Настройка',
        nodes: [
            { id: 'N3', title: 'Настройка T-Mail & GoldED', desc: 'Конфигурация ПО для работы в сети.', color: '#9C27B0' }
        ]
    },
    {
        act: 'Акт 3: Сообщество (Branching)',
        nodes: [
            { id: 'N4', title: 'Эхоконференции (Echo)', desc: 'Чтение правил, выбор стратегии поведения.', color: '#FF9800' },
            { id: 'N4a', title: '[Путь Дипломата]', desc: 'Успокоить тролля словом (Глас Разума).', color: '#8BC34A' },
            { id: 'N4b', title: '[Путь Технаря]', desc: 'Вычислить адрес тролля (TRACE).', color: '#FF5722' }
        ]
    },
    {
        act: 'Акт 4: Апгрейд (Node Status)',
        nodes: [
            { id: 'N5', title: 'Радиорынок', desc: 'Покупка US Robotics Courier.', color: '#795548' },
            { id: 'N6', title: 'Ночная вахта (ZMH)', desc: 'Получение статуса Ноды.', color: '#607D8B' }
        ]
    },
    {
        act: 'Акт 5: Кризис (Branching)',
        nodes: [
            { id: 'N7', title: 'Критический сбой', desc: 'Помехи на линии или война в эхах.', color: '#E91E63' },
            { id: 'N7a', title: '[Путь Технаря]', desc: 'Ремонт линии (Шумоподавление).', color: '#8BC34A' },
            { id: 'N7b', title: '[Путь Дипломата]', desc: 'Великое перемирие в эхах.', color: '#FFC107' }
        ]
    },
    {
        act: 'Акт 6: Финал',
        nodes: [
            { id: 'N8', title: 'Встреча с Координатором', desc: 'Финальное собеседование и итоги карьеры.', color: '#000000' }
        ]
    }
];

function DistrictMap() {
    return (
        <MapContainer>
            <Header>КАРТА ПРОГРЕССИИ (ROADMAP)</Header>
            <Content>
                {GAME_PATH.map((act, idx) => (
                    <ActBlock key={idx}>
                        <ActTitle>{act.act}</ActTitle>
                        <NodeList>
                            {act.nodes.map(node => (
                                <NodeItem key={node.id}>
                                    <NodeIcon color={node.color}>{node.id}</NodeIcon>
                                    <NodeInfo>
                                        <NodeTitle>{node.title}</NodeTitle>
                                        <NodeDesc>{node.desc}</NodeDesc>
                                    </NodeInfo>
                                </NodeItem>
                            ))}
                        </NodeList>
                    </ActBlock>
                ))}
            </Content>
        </MapContainer>
    );
}

export default DistrictMap;