
import sys
import os
import time
import codecs
import optparse
import numpy as np
from loader import prepare_sentence
from utils import create_input, iobes_iob, zero_digits
from model import Model

optparser = optparse.OptionParser()
optparser.add_option(
    "-m", "--model", default="models/food/",
    help="Model location"
)
optparser.add_option(
    "-d", "--delimiter", default=" ",
    help="Delimiter to separate words from their tags"
)
opts = optparser.parse_args()[0]

# Check parameters validity
assert opts.delimiter
assert os.path.isdir(opts.model)


# Load existing model
print "Loading model..."
model = Model(model_path=opts.model)
parameters = model.parameters

# Load reverse mappings
word_to_id, char_to_id, tag_to_id = [
    {v: k for k, v in x.items()}
    for x in [model.id_to_word, model.id_to_char, model.id_to_tag]
]

# Load the model
_, f_eval = model.build(training=False, **parameters)
model.reload()

# Ready to Tag
print "Ready"

while 1:
    try:
        line = sys.stdin.readline()
    except KeyboardInterrupt:
        break

    if not line:
        break

    words = line.rstrip().split()
    if line:
        # Lowercase sentence
        if parameters['lower']:
            line = line.lower()
        # Replace all digits with zeros
        if parameters['zeros']:
            line = zero_digits(line)
        # Prepare input
        sentence = prepare_sentence(words, word_to_id, char_to_id,
                                    lower=parameters['lower'])
        input = create_input(sentence, parameters, False)
        # Decoding
        if parameters['crf']:
            y_preds = np.array(f_eval(*input))[1:-1]
        else:
            y_preds = f_eval(*input).argmax(axis=1)
        y_preds = [model.id_to_tag[y_pred] for y_pred in y_preds]
        # Output tags in the IOB2 format
        if parameters['tag_scheme'] == 'iobes':
            y_preds = iobes_iob(y_preds)
        # Write tags
        assert len(y_preds) == len(words)
        sys.stdout.write('%s' % ''.join('%s%s%s\n' % (w, opts.delimiter, y)
                                            for w, y in zip(words, y_preds)))