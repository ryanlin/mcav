from sys import argv
import bagpy
from bagpy import bagreader
import pandas as pd

if __name__ == "__main__":

	pd.set_option("display.max_rows", None, "display.max_columns", 1)

	b = bagreader(argv[1], False, False)

	# get the list of topics
	print(b.topic_table)
