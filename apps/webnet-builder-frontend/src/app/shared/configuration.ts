export const Activation = {
  key: 'activation',
  label: 'Activation Function',
  controlType: 'dropdown',
  options: {
    softmax: 'Softmax',
    sigmoid: 'Sigmoid',
    relu: 'ReLU',
    elu: 'ELU',
    hardSigmoid: 'Hard Sigmoid',
    linear: 'Linear',
    relu6: 'ReLU6',
    selu: 'SELU',
    softplus: 'Softplus',
    softsign: 'Softsign',
    tanh: 'Tanh',
    swish: 'Swish',
    mish: 'Mish'
  },
  tooltip: 'Activation function to use. If unspecified, no activation is applied.'
};

export const RecurrentActivation = {
  key: 'recurrentActivation',
  label: 'Recurrent Activation Function',
  controlType: 'dropdown',
  options: {
    softmax: 'Softmax',
    sigmoid: 'Sigmoid',
    relu: 'ReLU',
    elu: 'ELU',
    hardSigmoid: 'Hard Sigmoid',
    linear: 'Linear',
    relu6: 'ReLU6',
    selu: 'SELU',
    softplus: 'Softplus',
    softsign: 'Softsign',
    tanh: 'Tanh',
    swish: 'Swish',
    mish: 'Mish'
  },
  tooltip: 'Activation function to use for the recurrent step. If unspecified, no activation is applied.'
};

export const Units = {
  key: 'units',
  label: 'Units',
  controlType: 'textbox',
  type: 'number',
  tooltip: 'Positive integer, dimensionality of the output space.'
};

export const Shape = {
  key: 'shape',
  label: 'Input Shape',
  controlType: 'textbox',
  type: 'text',
  tooltip: 'Defines the shape of the input data, excluding the batch size. For example, shape=[6] indicates that each input in a batch will have 6 features. For time series data, use a 2D array like [timesteps, features], where timesteps represent the sequence length and features represent the number of features at each time step.'
};

export const Padding = {
  key: 'padding',
  label: 'Padding',
  controlType: 'dropdown',
  options: {valid: 'Valid', same: 'Same', casual: 'Casual'},
  tooltip: ' Padding mode.'
};

export const Rate = {
  key: 'rate',
  label: 'Rate',
  controlType: 'textbox',
  type: 'number',
  tooltip: ' Float between 0 and 1. Fraction of the input units to drop.'
};

export const Filters = {
  key: 'filters',
  label: 'Filters',
  controlType: 'textbox',
  type: 'number',
  tooltip: 'The dimensionality of the output space (i.e. the number of filters in the convolution).'
};

export const KernelSize = {
  key: 'kernelSize',
  label: 'Kernel Size',
  controlType: 'textbox',
  type: 'number',
  tooltip: 'The dimensions of the convolution window. If kernelSize is a number, the convolutional window will be square.'
};

export const Strides = {
  key: 'strides',
  label: 'Strides',
  controlType: 'textbox',
  type: 'number',
  tooltip: 'The strides of the convolution in each dimension. If strides is a number, strides in both dimensions are equal.'
};

export const PoolSize = {
  key: 'poolSize',
  label: 'Pool Size',
  controlType: 'textbox',
  type: 'number',
  tooltip: 'Factors by which to downscale in each dimension [vertical, horizontal].'
};
