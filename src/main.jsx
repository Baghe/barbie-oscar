import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { init, isTMA, mockTelegramEnv, parseInitData, retrieveLaunchParams } from '@telegram-apps/sdk-react';
import App from './App';

if (import.meta.env.DEV) {
  const RawSearchParam = new URLSearchParams('user=%7B%22id%22%3A1194709210%2C%22first_name%22%3A%22Baghe%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22baghe%22%2C%22language_code%22%3A%22it%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FCwRKdZWlaxUVN6h8u4LYpfHbD33-gtpQoXBIHfjcOPg.svg%22%7D&chat_instance=1506973585231287040&chat_type=private&auth_date=1738667648&signature=Bj5OH-9LM3hA95kqXUsqIEI3tHq2z5r_PmNjpxSrkMv1FttZwX5BOQwdnZJOaTy9ad11ds77nhkPcHB3XdP3Dw&hash=b5e944e749d89311820a3b41de1480f9b4abcb17ca79f3cc3bf5df5fb19e90e0')
  await (async () => {
    if (await isTMA()) {
      return
    }
    let lp
    try {
      lp = retrieveLaunchParams()
    } catch (e) {
      lp = {
        themeParams: {
          accentTextColor: '#6ab2f2',
          bgColor: '#17212b',
          buttonColor: '#5288c1',
          buttonTextColor: '#ffffff',
          destructiveTextColor: '#ec3942',
          headerBgColor: '#17212b',
          hintColor: '#708499',
          linkColor: '#6ab3f3',
          secondaryBgColor: '#232e3c',
          sectionBgColor: '#17212b',
          sectionHeaderTextColor: '#6ab3f3',
          subtitleTextColor: '#708499',
          textColor: '#f5f5f5',
        },
        initData: parseInitData(RawSearchParam),
        initDataRaw: RawSearchParam,
        version: '8',
        platform: 'tdesktop',
      }
    }

    mockTelegramEnv(lp)
  })();
}

init()
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
