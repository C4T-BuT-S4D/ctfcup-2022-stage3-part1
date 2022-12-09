## Локальная компиляция контрактов для начала работы
  - Необходимо заполнить поле `DEPLOY_KEY` в файле `config.json` любыми 32 байтами в виде hex-строки
  - `npm install`
  - `npx hardhat compile`


## Исправление уязвимостей
  - В репозитории разрешается менять только файлы `.sol`. Гарантируется, что этого достаточно для исправления любой уязвимости
  - Так как для указания на котракт используется прокси, перед любым исправлением сверяйтесь с https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable
  - Если есть необходимость добавить поле в storage конракта, то делайте это только в конец и ничего не удаляйте. Также не инициализируйте это поле по дефолту или в конструкторе. И сверяйтесь со ссылкой выше

## Написание эксплоитов
  - Написание эксплоита происходит посредством редактирования контракта `Exploit.sol`
  - При редактировании контракта не забывайте про пункты, описанные выше
  - Не забудьте поменять проверку пароля в функции `checkPassword` или реализовать свою
  - Контракт обязан иметь набор структур
    - `struct BoxAttackData { address kawaiGazPromBank; uint256 tokenId; }`
    - `struct CoinAttackData { address kawaiGazPromBank; uint256 itemId; }`
    - `struct CardAttackData { address kawaiGazPromBank; uint256 cardId; uint256 signId; }`
  - Контракт обязан иметь набор публичных матодов
    - `addBoxAttackData(BoxAttackData)`
    - `addCoinAttackData(CoinAttackData)`
    - `addCardAttackData(CardAttackData)`
    - `exploit()`
  - Раз в некоторое время проверяющая система будет вызывать метод `exploit()`. Флаги необходимо будет забирать из контракта самостоятельно

## Настройки сети
  - Участникам доступен следующий набор rpc методов: `["eth_blockNumber", "eth_call", "eth_chainId", "net_version"]`
  - Количество `gas` на один запуск метода `exploit` равняется `50000000`
