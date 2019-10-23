package ricoh.trial.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class TrialUtil {
	/**
	 * Converts an InputStream to a string.
	 * 
	 * @param inputStream
	 * @return String
	 * @throws IOException
	 */
	public static String convertInputStreamToString(InputStream inputStream) throws IOException {
		if (inputStream == null) {
			return null;
		}

		StringBuilder builder = new StringBuilder();
		try {
			String line = null;
			BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, "UTF-8"));
			while ((line = reader.readLine()) != null) {
				builder.append(line).append("\n");
			}
		} catch (Exception e) {
			
		} finally {
			inputStream.close();
		}
		return builder.toString();
	}
}
