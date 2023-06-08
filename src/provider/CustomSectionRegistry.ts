import React, { PropsWithChildren } from 'react';

export class CustomSectionRegistry {
  private definitions: Map<string, CustomSection<any>> = new Map();

  define<TData>(type: string, section: CustomSection<TData>): this {
    this.definitions.set(type, section);
    return this;
  }

  getComponent(type: string): CustomSectionComponent<any> | undefined {
    return this.definitions.get(type)?.component;
  }

  getResolver(type: string): (() => Promise<any>) | undefined {
    return this.definitions.get(type)?.dataResolver;
  }
}

type CustomSection<TData = {}> = {
  component: CustomSectionComponent<TData>,
  dataResolver?: () => Promise<TData>
};

type CustomSectionComponent<TData> = React.FC<PropsWithChildren<{ data: TData }>>;
