
type TechnologyType = 'Fibre' | 'Fibre To The Node' | 'Wireless' | 'HFC' | 'Fibre To The Curb' | 'Fibre To The Building' | 'Satellite';
type TechnologyCategory = 'FixedLine' | 'FibreUpgrade' | 'FWUpgrade';
type Action = 'redirect' | 'button' | 'basicinfo'
type technologyOption = {
  tech: TechnologyCategory | TechnologyType,
  name: string,
  action: Action,
  link?: string,
}

export type AppProps = {
  mode: 'quicklookup' | 'fulllookup',
  techOpts: technologyOption[],
}
