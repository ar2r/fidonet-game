import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

const MAP_WIDTH = 1320;
const MAP_HEIGHT = 760;

const DISTRICT_NODES = {
    N1: {
        id: 'N1',
        title: 'Подъезд игрока',
        type: 'start',
        area: 'Дом 12, кв. 47',
        description: 'Стартовая точка. Здесь игрок собирает сетап и готовится к первому выходу в сеть.',
        x: 120,
        y: 650,
    },
    N2: {
        id: 'N2',
        title: 'Инициализация модема',
        type: 'main',
        area: 'Домашний стол',
        description: 'Команда ATZ и проверка, что железо готово к дозвону.',
        x: 220,
        y: 585,
    },
    N3: {
        id: 'N3',
        title: 'Первый дозвон',
        type: 'main',
        area: 'Телефонная точка',
        description: 'Переход в онлайн через первый успешный звонок на BBS.',
        x: 330,
        y: 535,
    },
    N4: {
        id: 'N4',
        title: 'Скачать софт',
        type: 'main',
        area: 'Киоск с дискетами',
        description: 'Получение T-Mail и GoldED для дальнейшей прогрессии.',
        x: 450,
        y: 485,
    },
    N5: {
        id: 'N5',
        title: 'Настройка станции',
        type: 'main',
        area: 'АТС района',
        description: 'Настройка конфигов t-mail и golded, фиксация рабочего контура.',
        x: 590,
        y: 420,
    },
    N6: {
        id: 'N6',
        title: 'Poll + Rules + Post',
        type: 'main',
        area: 'Доска объявлений',
        description: 'Первый почтовый цикл: прозвон, чтение правил, старт общения.',
        x: 730,
        y: 360,
    },
    B1: {
        id: 'B1',
        title: 'Развилка стиля',
        type: 'split',
        area: 'Перекресток дворов',
        description: 'Ключевой выбор тона поведения: конструктивный или конфликтный путь.',
        x: 840,
        y: 300,
    },
    N7: {
        id: 'N7',
        title: 'Конструктивный путь',
        type: 'main',
        area: 'Штаб актива',
        description: 'Рост репутации через союзников и работу с сообществом.',
        x: 965,
        y: 210,
    },
    N8: {
        id: 'N8',
        title: 'Конфликтный путь',
        type: 'main',
        area: 'Гаражный кооператив',
        description: 'Давление, флейм и высокая вероятность эскалации.',
        x: 960,
        y: 390,
    },
    S1: {
        id: 'S1',
        title: 'Призрак в Эхе',
        type: 'side',
        area: 'Старая НИИ-подстанция',
        description: 'Побочная арка расследования аномального адреса.',
        x: 650,
        y: 225,
    },
    S2: {
        id: 'S2',
        title: 'Война Поинтов',
        type: 'side',
        area: 'Пустырь у гаражей',
        description: 'Коллективный конфликт с риском перейти грань правил.',
        x: 1045,
        y: 430,
    },
    S3: {
        id: 'S3',
        title: 'Девушка в Сети',
        type: 'side',
        area: 'Школьный двор',
        description: 'Социальная ветка, которая может вернуть в любую из главных линий.',
        x: 785,
        y: 170,
    },
    S4: {
        id: 'S4',
        title: 'Гроза',
        type: 'risk',
        area: 'Трансформаторная будка',
        description: 'Событие риска: модем может сгореть при неверном решении.',
        x: 495,
        y: 330,
    },
    N9: {
        id: 'N9',
        title: 'Кризис сети',
        type: 'risk',
        area: 'Энергоузел района',
        description: 'Критическая фаза перед финальным выбором.',
        x: 1095,
        y: 300,
    },
    B2: {
        id: 'B2',
        title: 'Финальная развилка',
        type: 'split',
        area: 'Районный узел',
        description: 'Выбор ценностей и траектории концовки.',
        x: 1195,
        y: 300,
    },
    F1: {
        id: 'F1',
        title: 'Легенда сети',
        type: 'final',
        area: 'Центральный узел связи',
        description: 'Лучший финал: игрок удерживает сеть и становится сильным лидером.',
        x: 1260,
        y: 190,
    },
    F2: {
        id: 'F2',
        title: 'Sellout',
        type: 'bad',
        area: 'Офис провайдера',
        description: 'Финал выгоды: отказ от сетевой этики ради денег.',
        x: 1260,
        y: 300,
    },
    F3: {
        id: 'F3',
        title: 'Burnout',
        type: 'bad',
        area: 'Тихий двор без связи',
        description: 'Технический или ментальный крах, выход из игры через потерю инфраструктуры.',
        x: 1260,
        y: 430,
    },
    F4: {
        id: 'F4',
        title: 'Secret/Matrix',
        type: 'secret',
        area: 'Закрытый техподвал',
        description: 'Секретная концовка через скрытую последовательность действий.',
        x: 1180,
        y: 110,
    },
};

const ROUTES = [
    { from: 'N1', to: 'N2', type: 'main' },
    { from: 'N2', to: 'N3', type: 'main' },
    { from: 'N3', to: 'N4', type: 'main' },
    { from: 'N4', to: 'N5', type: 'main' },
    { from: 'N5', to: 'N6', type: 'main' },
    { from: 'N6', to: 'B1', type: 'main' },
    { from: 'B1', to: 'N7', type: 'alt', label: 'конструктив' },
    { from: 'B1', to: 'N8', type: 'alt', label: 'флейм' },
    { from: 'B1', to: 'S3', type: 'alt', label: 'личная линия' },
    { from: 'N7', to: 'N9', type: 'main' },
    { from: 'N8', to: 'S2', type: 'alt' },
    { from: 'S2', to: 'N9', type: 'alt' },
    { from: 'N6', to: 'S1', type: 'alt' },
    { from: 'S1', to: 'N9', type: 'alt' },
    { from: 'N4', to: 'S4', type: 'risk' },
    { from: 'N5', to: 'S4', type: 'risk' },
    { from: 'S4', to: 'N9', type: 'main', label: 'успех' },
    { from: 'S4', to: 'F3', type: 'risk', label: 'провал' },
    { from: 'N9', to: 'B2', type: 'main' },
    { from: 'B2', to: 'F1', type: 'main', label: 'сеть' },
    { from: 'B2', to: 'F2', type: 'alt', label: 'деньги' },
    { from: 'B2', to: 'F4', type: 'alt', label: 'пасхалка' },
];

const HOUSES = [
    { id: 'H1', label: 'Дом 12', x: 45, y: 540, width: 170, height: 92 },
    { id: 'H2', label: 'Дом 14', x: 255, y: 585, width: 190, height: 86 },
    { id: 'H3', label: 'Дом 16', x: 480, y: 560, width: 220, height: 90 },
    { id: 'H4', label: 'Дом 18', x: 760, y: 560, width: 185, height: 88 },
    { id: 'H5', label: 'Дом 20', x: 975, y: 560, width: 220, height: 92 },
    { id: 'H6', label: 'Дом 22', x: 110, y: 90, width: 180, height: 84 },
    { id: 'H7', label: 'Дом 24', x: 330, y: 90, width: 220, height: 84 },
    { id: 'H8', label: 'Дом 26', x: 615, y: 95, width: 215, height: 84 },
    { id: 'H9', label: 'Дом 28', x: 885, y: 95, width: 200, height: 84 },
];

const STREET_LABELS = [
    { text: 'ул. Модемная', x: 65, y: 700 },
    { text: 'пр-т Поинтов', x: 555, y: 700 },
    { text: 'ул. Эхоконф', x: 1040, y: 700 },
    { text: 'пер. SysOp', x: 25, y: 355, vertical: true },
    { text: 'пер. BBS', x: 1288, y: 355, vertical: true },
];

const NODE_COLORS = {
    start: '#0B3D91',
    main: '#1D4ED8',
    split: '#D97706',
    side: '#475569',
    risk: '#B91C1C',
    final: '#14532D',
    bad: '#7F1D1D',
    secret: '#312E81',
};

function getStrokeForRoute(type) {
    switch (type) {
        case 'alt':
            return '#D97706';
        case 'risk':
            return '#B91C1C';
        case 'main':
        default:
            return '#1D4ED8';
    }
}

function getDashForRoute(type) {
    if (type === 'alt') {
        return '9 7';
    }
    if (type === 'risk') {
        return '4 5';
    }
    return undefined;
}

function DistrictMap() {
    const [selectedNodeId, setSelectedNodeId] = useState('N1');

    const node = DISTRICT_NODES[selectedNodeId];

    const outgoing = useMemo(() => {
        const graph = {};
        Object.keys(DISTRICT_NODES).forEach(id => {
            graph[id] = [];
        });

        ROUTES.forEach(route => {
            graph[route.from].push(route);
        });

        return graph;
    }, []);

    return (
        <Container>
            <Header>
                Карта района: путь игрока от подъезда до финального узла
            </Header>
            <ContentLayout>
                <MapViewport>
                    <MapCanvas>
                        <Street x={40} y={675} width={1240} height={34} />
                        <Street x={30} y={305} width={1260} height={32} />
                        <Street x={270} y={30} width={36} height={700} />
                        <Street x={885} y={35} width={34} height={690} />

                        {STREET_LABELS.map(street => (
                            <StreetLabel
                                key={street.text}
                                style={{
                                    left: street.x,
                                    top: street.y,
                                    transform: street.vertical ? 'rotate(-90deg)' : 'none',
                                    transformOrigin: street.vertical ? 'left top' : 'center',
                                }}
                            >
                                {street.text}
                            </StreetLabel>
                        ))}

                        {HOUSES.map(house => (
                            <Building
                                key={house.id}
                                style={{
                                    left: house.x,
                                    top: house.y,
                                    width: house.width,
                                    height: house.height,
                                }}
                            >
                                <BuildingTop>
                                    <span>{house.label}</span>
                                    <span>5 ЭТ.</span>
                                </BuildingTop>
                                <WindowGrid>
                                    {Array.from({ length: 18 }).map((_, i) => (
                                        <WindowPixel key={`${house.id}-${i}`} />
                                    ))}
                                </WindowGrid>
                            </Building>
                        ))}

                        <RouteOverlay viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} preserveAspectRatio="none">
                            <defs>
                                <marker id="arrow-main" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#1D4ED8" />
                                </marker>
                                <marker id="arrow-alt" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#D97706" />
                                </marker>
                                <marker id="arrow-risk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#B91C1C" />
                                </marker>
                            </defs>
                            {ROUTES.map(route => {
                                const from = DISTRICT_NODES[route.from];
                                const to = DISTRICT_NODES[route.to];
                                const stroke = getStrokeForRoute(route.type);
                                const marker = route.type === 'main' ? 'url(#arrow-main)' : route.type === 'risk' ? 'url(#arrow-risk)' : 'url(#arrow-alt)';
                                const midX = (from.x + to.x) / 2;
                                const midY = (from.y + to.y) / 2;

                                return (
                                    <g key={`${route.from}-${route.to}-${route.label || ''}`}>
                                        <line
                                            x1={from.x}
                                            y1={from.y}
                                            x2={to.x}
                                            y2={to.y}
                                            stroke={stroke}
                                            strokeWidth={route.type === 'main' ? 6 : 4}
                                            strokeDasharray={getDashForRoute(route.type)}
                                            opacity={0.95}
                                            markerEnd={marker}
                                        />
                                        {route.label && (
                                            <text
                                                x={midX}
                                                y={midY - 8}
                                                textAnchor="middle"
                                                fontSize="12"
                                                fontFamily="'MS Sans Serif', sans-serif"
                                                fill="#111827"
                                                stroke="#F3EEE2"
                                                strokeWidth="3"
                                                paintOrder="stroke"
                                            >
                                                {route.label}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </RouteOverlay>

                        {Object.values(DISTRICT_NODES).map(item => (
                            <NodeButton
                                key={item.id}
                                type="button"
                                style={{
                                    left: item.x,
                                    top: item.y,
                                    backgroundColor: NODE_COLORS[item.type],
                                    boxShadow: selectedNodeId === item.id ? '0 0 0 4px rgba(255, 255, 255, 0.85), 0 0 0 6px rgba(0, 0, 0, 0.45)' : '0 1px 0 rgba(255, 255, 255, 0.3)',
                                }}
                                onClick={() => setSelectedNodeId(item.id)}
                                aria-label={`${item.id} ${item.title}`}
                            >
                                {item.id}
                            </NodeButton>
                        ))}
                    </MapCanvas>
                </MapViewport>

                <InfoPanel>
                    <PanelTitle>Узел {node.id}</PanelTitle>
                    <InfoLine><b>{node.title}</b></InfoLine>
                    <InfoLine>Локация: {node.area}</InfoLine>
                    <InfoLine>Тип: {node.type}</InfoLine>
                    <InfoLine>{node.description}</InfoLine>

                    <PanelTitle style={{ marginTop: 14 }}>Переходы</PanelTitle>
                    {outgoing[selectedNodeId].length === 0 && (
                        <InfoLine>Нет исходящих переходов (конечная точка).</InfoLine>
                    )}
                    {outgoing[selectedNodeId].map(route => (
                        <InfoLine key={`${route.from}-${route.to}-${route.label || 'none'}`}>
                            {route.to}: {DISTRICT_NODES[route.to].title}
                            {route.label ? ` (${route.label})` : ''}
                        </InfoLine>
                    ))}

                    <PanelTitle style={{ marginTop: 14 }}>Легенда</PanelTitle>
                    <LegendItem><LegendSwatch style={{ background: '#1D4ED8' }} />Основной маршрут</LegendItem>
                    <LegendItem><LegendSwatch style={{ background: '#D97706' }} />Альтернативная ветка</LegendItem>
                    <LegendItem><LegendSwatch style={{ background: '#B91C1C' }} />Риск/аварийная ветка</LegendItem>
                    <LegendItem><LegendSwatch style={{ background: '#B0B7C3' }} />Пятиэтажка/квартал</LegendItem>
                </InfoPanel>
            </ContentLayout>
            <FooterHint>
                Кликните по маркеру узла, чтобы посмотреть описание и исходящие переходы. Центральный путь идет от N1 к B2.
            </FooterHint>
        </Container>
    );
}

const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #d8cfbc;
    color: #111827;
    font-family: 'MS Sans Serif', sans-serif;
`;

const Header = styled.div`
    background: #645b49;
    color: #f8f4ea;
    font-size: 13px;
    font-weight: bold;
    letter-spacing: 0.02em;
    padding: 8px 12px;
    border-bottom: 2px solid #3f372c;
`;

const ContentLayout = styled.div`
    flex: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    min-height: 0;

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
        grid-template-rows: minmax(0, 1fr) auto;
    }
`;

const MapViewport = styled.div`
    position: relative;
    min-height: 0;
    overflow: auto;
    background: #ddd3be;
    border-right: 2px solid rgba(0, 0, 0, 0.2);

    @media (max-width: 980px) {
        border-right: none;
        border-bottom: 2px solid rgba(0, 0, 0, 0.2);
    }
`;

const MapCanvas = styled.div`
    position: relative;
    width: ${MAP_WIDTH}px;
    height: ${MAP_HEIGHT}px;
    background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.23), rgba(255, 255, 255, 0)),
        repeating-linear-gradient(0deg, rgba(94, 84, 62, 0.08) 0px, rgba(94, 84, 62, 0.08) 1px, transparent 1px, transparent 32px),
        repeating-linear-gradient(90deg, rgba(94, 84, 62, 0.08) 0px, rgba(94, 84, 62, 0.08) 1px, transparent 1px, transparent 32px),
        #d7ccb6;
`;

const Street = styled.div`
    position: absolute;
    background: linear-gradient(180deg, #7f8794, #636b77);
    border: 1px solid rgba(0, 0, 0, 0.3);
    z-index: 1;
`;

const StreetLabel = styled.div`
    position: absolute;
    z-index: 2;
    font-size: 11px;
    font-weight: bold;
    color: #2d2419;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    user-select: none;
`;

const Building = styled.div`
    position: absolute;
    z-index: 2;
    padding: 5px 6px;
    border: 2px solid #697183;
    background: linear-gradient(180deg, #b8bec8 0%, #939dac 100%);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4), 0 2px 0 rgba(0, 0, 0, 0.2);
`;

const BuildingTop = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 6px;
    font-size: 10px;
    font-weight: bold;
    color: #131a2a;
    text-transform: uppercase;
`;

const WindowGrid = styled.div`
    margin-top: 6px;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 2px;
`;

const WindowPixel = styled.span`
    display: block;
    height: 6px;
    background: #f1e2a8;
    border: 1px solid rgba(34, 34, 34, 0.22);
`;

const RouteOverlay = styled.svg`
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
`;

const NodeButton = styled.button`
    position: absolute;
    z-index: 4;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    color: #ffffff;
    font-size: 10px;
    font-weight: bold;
    text-align: center;
    transform: translate(-50%, -50%);
    cursor: pointer;
    transition: transform 120ms ease;
    padding: 0;

    &:hover {
        transform: translate(-50%, -50%) scale(1.07);
    }
`;

const InfoPanel = styled.aside`
    background: #efe6d4;
    border-left: 1px solid rgba(0, 0, 0, 0.2);
    padding: 10px 12px;
    overflow: auto;
`;

const PanelTitle = styled.h3`
    margin: 0;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #433828;
`;

const InfoLine = styled.p`
    margin: 8px 0;
    font-size: 12px;
    line-height: 1.35;
`;

const LegendItem = styled.p`
    margin: 7px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
`;

const LegendSwatch = styled.span`
    width: 14px;
    height: 14px;
    border: 1px solid rgba(0, 0, 0, 0.4);
    display: inline-block;
`;

const FooterHint = styled.div`
    border-top: 2px solid rgba(0, 0, 0, 0.2);
    background: #d0c3ab;
    padding: 6px 10px;
    font-size: 11px;
    color: #2b2114;
`;

export default DistrictMap;
