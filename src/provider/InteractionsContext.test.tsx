import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { InteractionsProvider, InteractionsContext } from './InteractionsContext';
import { Interaction } from '@cntrl-site/sdk';

describe('InteractionsProvider', () => {
  const interactions: Interaction[] = [
    {
      id: 'interaction1',
      startStateId: 'state1',
      triggers: [
        { itemId: 'item1', type: 'click', from: 'state1', to: 'state2' }
      ],
      states: [{ id: 'state1' }, { id: 'state2' }]
    },
    {
      id: 'interaction2',
      startStateId: 'state3',
      triggers: [
        { itemId: 'item2', type: 'hover-in', from: 'state3', to: 'state4' }
      ],
      states: [{ id: 'state3' }, { id: 'state4' }]
    }
  ];

  it('should generate correct default interactionsStatesMap', () => {
    let contextValue;

    render(
      <InteractionsProvider interactions={interactions}>
        <InteractionsContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </InteractionsContext.Consumer>
      </InteractionsProvider>
    );

    expect(contextValue!).toBeDefined();
    expect(contextValue!.interactionsStatesMap).toEqual({
      interaction1: 'state1',
      interaction2: 'state3'
    });
  });

  it('should correctly update interactionsStatesMap when transitionTo is called', async () => {
    let contextValue;

    render(
      <InteractionsProvider interactions={interactions}>
        <InteractionsContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </InteractionsContext.Consumer>
      </InteractionsProvider>
    );

    expect(contextValue!).toBeDefined();
    contextValue!.transitionTo('interaction1', 'state2');

    await waitFor(() => {
      expect(contextValue!.interactionsStatesMap['interaction1']).toBe('state2');
    });
  });

  it('should return the correct trigger using getItemTrigger', () => {
    let contextValue;

    render(
      <InteractionsProvider interactions={interactions}>
        <InteractionsContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </InteractionsContext.Consumer>
      </InteractionsProvider>
    );

    expect(contextValue!).toBeDefined();

    // Check the correct trigger is returned
    const trigger = contextValue!.getItemTrigger('item1', 'click');
    expect(trigger).toEqual({
      id: 'interaction1',
      from: 'state1',
      to: 'state2',
    });

    // Check that no trigger is returned when conditions don't match
    const noTrigger = contextValue!.getItemTrigger('item1', 'hover-on');
    expect(noTrigger).toBeNull();
  });
});
