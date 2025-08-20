import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { Button } from '@/components/ui/button';

test.describe('Button Component', () => {
  test('should render with default props', async ({ mount }) => {
    const component = await mount(<Button>Click me</Button>);
    
    await expect(component).toBeVisible();
    await expect(component).toHaveText('Click me');
    await expect(component).toHaveAttribute('type', 'button');
  });

  test('should handle different variants', async ({ mount }) => {
    const primaryButton = await mount(<Button variant="default">Primary</Button>);
    const secondaryButton = await mount(<Button variant="secondary">Secondary</Button>);
    const outlineButton = await mount(<Button variant="outline">Outline</Button>);
    
    await expect(primaryButton).toBeVisible();
    await expect(secondaryButton).toBeVisible();
    await expect(outlineButton).toBeVisible();
  });

  test('should handle different sizes', async ({ mount }) => {
    const smallButton = await mount(<Button size="sm">Small</Button>);
    const defaultButton = await mount(<Button>Default</Button>);
    const largeButton = await mount(<Button size="lg">Large</Button>);
    
    await expect(smallButton).toBeVisible();
    await expect(defaultButton).toBeVisible();
    await expect(largeButton).toBeVisible();
  });

  test('should be disabled when disabled prop is true', async ({ mount }) => {
    const component = await mount(<Button disabled>Disabled</Button>);
    
    await expect(component).toBeDisabled();
    await expect(component).toHaveAttribute('disabled');
  });

  test('should handle click events', async ({ mount }) => {
    let clicked = false;
    const handleClick = () => { clicked = true; };
    
    const component = await mount(<Button onClick={handleClick}>Click me</Button>);
    
    await component.click();
    expect(clicked).toBe(true);
  });

  test('should support loading state', async ({ mount }) => {
    const component = await mount(<Button disabled>Loading...</Button>);
    
    await expect(component).toBeDisabled();
    await expect(component).toContainText('Loading');
  });

  test('should have proper accessibility attributes', async ({ mount }) => {
    const component = await mount(
      <Button aria-label="Submit form" type="submit">
        Submit
      </Button>
    );
    
    await expect(component).toHaveAttribute('aria-label', 'Submit form');
    await expect(component).toHaveAttribute('type', 'submit');
  });

  test('should support custom className', async ({ mount }) => {
    const component = await mount(
      <Button className="custom-class">Custom</Button>
    );
    
    await expect(component).toHaveClass(/custom-class/);
  });
});