export type LipatovSceneConfig = {
  scene: {
    id: string
    episode: string
    productionDay: string
    location: string
    context: string
  }
  bank: {
    productName: string
    pageTitle: string
    pageSection: string
    statusTitle: string
    statusDescription: string
    operationType: string
    operationStatus: string
    channel: string
    verification: string
  }
  transfer: {
    amount: number
    amountDisplay: string
    amountInputLabel: string
    amountMaskHint: string
    checkButtonText: string
    currencyNote: string
    sender: string
    senderRole: string
    client: string
    recipientDisplay: string
    destination: string
    destinationDetail: string
    accountDisplay: string
    requestId: string
    createdAt: string
    processedAt: string
    operatorNote: string
  }
  sceneControls: {
    enterHint: string
    blackoutHint: string
    screenMessage: string
    offlineMessage: string
  }
}

export const lipatovSceneConfig: LipatovSceneConfig = {
  scene: {
    id: "3-3 / 3-6",
    episode: "Серия 3",
    productionDay: "День 7",
    location: "Временная база картеля. Бетонные стены",
    context: "Липатов под давлением картеля подтверждает крупную банковскую заявку, затем видит на ноутбуке финальное уведомление и пытается вернуть управление, когда дисплей гаснет.",
  },
  bank: {
    productName: "Интернет-банк для корпоративных клиентов",
    pageTitle: "Платежное требование",
    pageSection: "Международные переводы",
    statusTitle: "Ваша заявка успешно обработана",
    statusDescription: "Заявка принята системой банка и направлена на дальнейшую банковскую обработку.",
    operationType: "Требование на перевод",
    operationStatus: "Обработана",
    channel: "Интернет-банк",
    verification: "Подтверждено клавишей ENTER",
  },
  transfer: {
    amount: 300000000,
    amountDisplay: "300 000 000",
    amountInputLabel: "Сумма требования",
    amountMaskHint: "Введите сумму целым числом: маска автоматически добавит .00, без ручного ввода точки и копеек.",
    checkButtonText: "Проверить платеж",
    currencyNote: "Валюта в сценарии не указана, поэтому на экран не выведен знак валюты.",
    sender: "Липатов Илья Сергеевич",
    senderRole: "корпоративный клиент",
    client: "крупная нефтяная компания",
    recipientDisplay: "данные получателя скрыты",
    destination: "Вануату",
    destinationDetail: "Океания",
    accountDisplay: "•••• •••• •••• ••••",
    requestId: "REQ-0306-LIPATOV",
    createdAt: "День 7, 20:40",
    processedAt: "День 7, 21:05",
    operatorNote: "После поступления средств на счета картель продолжает удерживать Липатова и требует от него еще одно действие.",
  },
  sceneControls: {
    enterHint: "Введите сумму целым числом — .00 добавится автоматически. Нажмите ENTER, чтобы проверить платеж и отправить заявку.",
    blackoutHint: "Для кадра 3-6 оставьте экран с уведомлением, затем погасите дисплей скриптом или кнопкой Blackout preview.",
    screenMessage: "Сигнал дисплея отсутствует",
    offlineMessage: "Ноутбук не отвечает. Повторное нажатие клавиш не меняет состояние.",
  },
}
