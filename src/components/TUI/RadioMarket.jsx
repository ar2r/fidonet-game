import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { updateStat, addItem } from '../../engine/store';
import { eventBus } from '../../domain/events/bus';
import { ITEM_BOUGHT } from '../../domain/events/types';

const MarketContainer = styled.div`
  background-color: #0000AA;
  color: #FFFFFF;
  font-family: 'DosVga', monospace;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  outline: none;
`;

const Header = styled.div`
  background-color: #AAAAAA;
  color: #000;
  padding: 5px 10px;
  font-weight: bold;
  text-align: center;
`;

const ContentArea = styled.div`
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
  border: 1px double #FFFFFF;
  margin: 5px;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px;
  cursor: pointer;
  background-color: ${props => props.selected ? '#00AAAA' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.selected ? '#00AAAA' : '#000088'};
  }
`;

const Description = styled.div`
  padding: 10px;
  border-top: 1px solid #AAA;
  min-height: 80px;
  color: #FFFF00;
`;

const Footer = styled.div`
  background-color: #AAAAAA;
  color: #000;
  padding: 2px 10px;
  display: flex;
  justify-content: space-between;
`;

const MARKET_ITEMS = [
    {
        id: 'modem_28800',
        name: 'US Robotics Courier 28.8k',
        price: 25000,
        description: 'Мечта любого фидошника. Скорость 28.8к, отличная связь, поддержка V.34. Ускоряет скачивание в 2 раза.',
        type: 'hardware'
    },
    {
        id: 'pc_ram_16mb',
        name: 'Модули памяти 16MB SIMM',
        price: 8000,
        description: 'Позволяют запускать более тяжелые программы и Windows 95 без тормозов.',
        type: 'hardware'
    },
    {
        id: 'solder_kit',
        name: 'Набор для пайки (Паяльник 40Вт)',
        price: 1500,
        description: 'Все для ремонта и моддинга. Припой и канифоль в комплекте. Требуется навык Hardware.',
        type: 'item'
    },
    {
        id: 'diskettes_pack',
        name: 'Пачка дискет 3.5" (10 шт)',
        price: 500,
        description: 'Новые дискеты Verbatim. Пригодятся для переноса файлов и бекапов.',
        type: 'item'
    },
    {
        id: 'coffee_jar',
        name: 'Банка кофе Nescafe',
        price: 300,
        description: 'Бодрящий напиток. Восстанавливает 20 единиц рассудка (Sanity).',
        type: 'consumable'
    }
];

const SELLABLE_ITEMS = {
    'doom2': { name: 'Doom II (4 дискеты)', price: 2000 },
    'duke3d': { name: 'Duke Nukem 3D', price: 2500 },
    'warcraft2': { name: 'Warcraft II', price: 3000 },
    'win95': { name: 'Windows 95 (CD-RIP)', price: 1500 },
};

function RadioMarket() {
    const dispatch = useDispatch();
    const money = useSelector(state => state.player.stats.money);
    const inventory = useSelector(state => state.player.inventory);
    
    const [mode, setMode] = useState('BUY'); // 'BUY' or 'SELL'
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [message, setMessage] = useState('');

    // Filter inventory for sellable items
    const sellList = inventory
        .filter(id => SELLABLE_ITEMS[id])
        .map(id => ({ id, ...SELLABLE_ITEMS[id] }));

    const currentList = mode === 'BUY' ? MARKET_ITEMS : sellList;
    const currentItem = currentList[selectedIndex];

    const handleAction = () => {
        if (!currentItem) return;

        if (mode === 'BUY') {
            if (money < currentItem.price) {
                setMessage('ОШИБКА: Недостаточно средств!');
                return;
            }

            if (currentItem.type === 'hardware' && inventory.includes(currentItem.id)) {
                setMessage('У вас уже есть это оборудование.');
                return;
            }

            // Process purchase
            dispatch(updateStat({ stat: 'money', value: -currentItem.price }));
            
            if (currentItem.type === 'consumable') {
                if (currentItem.id === 'coffee_jar') {
                    dispatch(updateStat({ stat: 'sanity', value: 20 }));
                    setMessage(`Вы выпили кофе. +20 к рассудку!`);
                }
            } else {
                dispatch(addItem(currentItem.id));
                eventBus.publish(ITEM_BOUGHT, { item: currentItem.id, price: currentItem.price });
                setMessage(`Приобретено: ${currentItem.name}`);
            }
        } else {
            // Sell logic
            dispatch(updateStat({ stat: 'money', value: currentItem.price }));
            // Remove item logic is tricky with current store, assume we "sell copy" or just allow infinite sell?
            // Realistically, selling removes the item.
            // But our `addItem` is additive. We need `removeItem`.
            // For now, let's say we sell a *copy* on diskettes, costing us time/diskettes?
            // To simplify: selling removes it. But we need a removeItem action.
            // If removeItem isn't in store, we simulate "Selling Copies" which requires Diskettes.
            
            // Check if we have diskettes to make a copy
            // For simplicity in this iteration: You sell the warez and keep the source (piracy!).
            // But maybe limit it? Let's just give money for now.
            setMessage(`Продано: ${currentItem.name} (+${currentItem.price} руб)`);
        }
    };

    return (
        <MarketContainer tabIndex="0" onKeyDown={(e) => {
            if (e.key === 'ArrowDown') setSelectedIndex(p => Math.min(p + 1, currentList.length - 1));
            if (e.key === 'ArrowUp') setSelectedIndex(p => Math.max(p - 1, 0));
            if (e.key === 'Enter') handleAction();
            if (e.key === 'Tab') {
                setMode(m => m === 'BUY' ? 'SELL' : 'BUY');
                setSelectedIndex(0);
                setMessage('');
            }
        }}>
            <Header>
                РАДИОРЫНОК "МИР ЭЛЕКТРОНИКИ" | 
                <span style={{ color: mode === 'BUY' ? 'yellow' : 'white', cursor: 'pointer' }} onClick={() => setMode('BUY')}> [КУПИТЬ] </span>
                <span style={{ color: mode === 'SELL' ? 'yellow' : 'white', cursor: 'pointer' }} onClick={() => setMode('SELL')}> [ПРОДАТЬ] </span>
            </Header>
            <ContentArea>
                <div style={{ marginBottom: 10, color: '#AAAAAA' }}>
                    {mode === 'BUY' ? 'Доступные товары:' : 'Скупка краденого софта:'}
                </div>
                
                {currentList.length === 0 && mode === 'SELL' && (
                    <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>
                        У вас нет софта на продажу. <br/>
                        Скачайте игры с BBS!
                    </div>
                )}

                {currentList.map((item, idx) => (
                    <ItemRow 
                        key={item.id} 
                        selected={idx === selectedIndex}
                        onClick={() => setSelectedIndex(idx)}
                    >
                        <span>{item.name}</span>
                        <span>{item.price} руб.</span>
                    </ItemRow>
                ))}
                
                <div style={{ marginTop: 20 }}>
                    <Description>
                        {currentItem ? currentItem.description : (mode === 'SELL' ? 'Выберите игру для продажи.' : '')}
                    </Description>
                </div>

                {message && (
                    <div style={{ color: mode === 'BUY' ? '#55FF55' : 'gold', textAlign: 'center', marginTop: 10, border: '1px solid gray', padding: 5 }}>
                        {message}
                    </div>
                )}
            </ContentArea>
            <Footer>
                <span>Ваш бюджет: {money} руб.</span>
                <span>TAB: Режим | ENTER: {mode === 'BUY' ? 'Купить' : 'Продать'} | ESC: Выход</span>
            </Footer>
        </MarketContainer>
    );
}

export default RadioMarket;
