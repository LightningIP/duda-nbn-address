
export type TechnologyType = 'Fibre' | 'HFC' | 'Fibre To The Node' | 'Fibre To The Curb' | 'Fibre To The Building' | 'Wireless' | 'Satellite';
type TechnologyCategory = 'FixedLine' | 'Wireless' | 'Satellite' | 'Enterprise' | 'FibreUpgrade' | 'HighSpeedFW';
type Action = 'redirect' | 'button' | 'basicinfo';

type DudaLink = {
  href: string;
  label: string;
  raw_url: string,
  rel?: null | string;
  target?: string;
  type: string;
  value: string;
};

export type TechnologyOption = {
  tech: TechnologyCategory,
  name: string,
  action: Action,
  link?: DudaLink,
}

export type AppProps = {
  mode: 'quicklookup' | 'fulllookup';
  techOpts: TechnologyOption[];
  inEditor?: boolean;
}
