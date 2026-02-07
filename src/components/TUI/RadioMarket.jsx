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
        id: 'diskettes_pack',
        name: 'Пачка дискет 3.5" (10 шт)',
        price: 1500,
        description: 'Новые дискеты Verbatim. Пригодятся для переноса файлов и бекапов.',
        type: 'item'
    },
    {
        id: 'coffee_jar',
        name: 'Банка кофе Nescafe',
        price: 800,
        description: 'Бодрящий напиток. Восстанавливает 20 единиц рассудка (Sanity).',
        type: 'consumable'
    },
    {
        id: 'pc_ram_16mb',
        name: 'Модули памяти 16MB SIMM',
        price: 12000,
        description: 'Позволяют запускать более тяжелые программы и Windows 95 без тормозов.',
        type: 'hardware'
    }
];

function RadioMarket() {
    const dispatch = useDispatch();
    const money = useSelector(state => state.player.stats.money);
    const inventory = useSelector(state => state.player.inventory);
    
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [message, setMessage] = useState('');

    const handleBuy = () => {
        const item = MARKET_ITEMS[selectedIndex];
        
        if (money < item.price) {
            setMessage('ОШИБКА: Недостаточно средств!');
            return;
        }

        if (item.type === 'hardware' && inventory.includes(item.id)) {
            setMessage('У вас уже есть это оборудование.');
            return;
        }

        // Process purchase
        dispatch(updateStat({ stat: 'money', value: -item.price }));
        
        if (item.type === 'consumable') {
            if (item.id === 'coffee_jar') {
                dispatch(updateStat({ stat: 'sanity', value: 20 }));
                setMessage(`Вы выпили кофе. +20 к рассудку!`);
            }
        } else {
            dispatch(addItem(item.id));
            eventBus.publish(ITEM_BOUGHT, { item: item.id, price: item.price });
            setMessage(`Приобретено: ${item.name}`);
        }
    };

    const currentItem = MARKET_ITEMS[selectedIndex];

    return (
        <MarketContainer tabIndex="0" onKeyDown={(e) => {
            if (e.key === 'ArrowDown') setSelectedIndex(p => Math.min(p + 1, MARKET_ITEMS.length - 1));
            if (e.key === 'ArrowUp') setSelectedIndex(p => Math.max(p - 1, 0));
            if (e.key === 'Enter') handleBuy();
        }}>
            <Header>РАДИОРЫНОК "МИР ЭЛЕКТРОНИКИ"</Header>
            <ContentArea>
                <div style={{ marginBottom: 10, color: '#AAAAAA' }}>Доступные товары:</div>
                {MARKET_ITEMS.map((item, idx) => (
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
                        {currentItem.description}
                    </Description>
                </div>

                {message && (
                    <div style={{ color: '#FF5555', textAlign: 'center', marginTop: 10, border: '1px solid red', padding: 5 }}>
                        {message}
                    </div>
                )}
            </ContentArea>
            <Footer>
                <span>Ваш бюджет: {money} руб.</span>
                <span>ENTER: Купить | ESC: Выход</span>
            </Footer>
        </MarketContainer>
    );
}

export default RadioMarket;
