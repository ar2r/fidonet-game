/**
 * Economy System - Bills and Payments
 */

export function checkBills(gameState, dispatch, actions, appendOutput) {
    const { day } = gameState.gameState;
    const { lastBillDay } = gameState.player;
    
    // Bill every 7 days (e.g. day 7, 14...)
    if (day > lastBillDay && day % 7 === 0) {
        const billAmount = 500; // Fixed weekly cost for line maintenance + usage logic could be here
        
        dispatch(actions.updateStat({ stat: 'debt', value: billAmount }));
        dispatch(actions.setLastBillDay(day));
        
        appendOutput("");
        appendOutput("========================================");
        appendOutput(" ВНИМАНИЕ: Пришел счет за телефон!");
        appendOutput(` Сумма к оплате: ${billAmount} руб.`);
        appendOutput(" Используйте команду PAY для оплаты.");
        appendOutput(" Неоплата приведет к отключению линии.");
        appendOutput("========================================");
        appendOutput("");
        
        return true;
    }
    
    return false;
}

export function checkDebtGameOver(gameState, dispatch, actions) {
    const { debt } = gameState.player.stats;
    const MAX_DEBT = 2000;
    
    if (debt > MAX_DEBT) {
        dispatch(actions.setGameOver('debt'));
        return true;
    }
    return false;
}
