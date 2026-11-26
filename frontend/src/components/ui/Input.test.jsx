import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Checkbox, Input, Select, Textarea } from './Input';

describe('shared form controls', () => {
  it('passes required and validation descriptions to the native controls', () => {
    const markup = renderToStaticMarkup(
      <div>
        <Input id="quantity" required error="Enter a valid quantity" />
        <Select id="crop" required error="Select a crop type" />
        <Textarea id="description" required error="Description is required" />
        <Checkbox id="terms" required error="Accept the demo terms" label="I agree" />
      </div>
    );

    expect(markup).toContain('id="quantity"');
    expect(markup).toContain('id="quantity-error"');
    expect(markup).toContain('aria-describedby="quantity-error"');
    expect(markup).toContain('id="crop"');
    expect(markup).toContain('id="crop-error"');
    expect(markup).toContain('aria-describedby="crop-error"');
    expect(markup).toContain('id="description"');
    expect(markup).toContain('id="description-error"');
    expect(markup).toContain('aria-describedby="description-error"');
    expect(markup).toContain('id="terms-error"');
    expect(markup).toContain('aria-describedby="terms-error"');
    expect((markup.match(/required=""/g) || [])).toHaveLength(4);
  });
});
