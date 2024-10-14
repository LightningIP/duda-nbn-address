
export type TechnologyType = 'Fibre' | 'HFC' | 'Fibre To The Node' | 'Fibre To The Curb' | 'Fibre To The Building' | 'Wireless' | 'Satellite';
type TechnologyCategory = 'FixedLine' | 'Wireless' | 'Satellite' | 'Enterprise' | 'FibreUpgrade' | 'HighSpeedFW';
type Action = 'redirect' | 'button' | 'basicinfo'
export type TechnologyOption = {
  tech: TechnologyCategory,
  name: string,
  action: Action,
  link?: string,
}

export type AppProps = {
  mode: 'quicklookup' | 'fulllookup',
  techOpts: TechnologyOption[],
}
