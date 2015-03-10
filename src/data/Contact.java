package data;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.joda.time.DateTime;
import org.joda.time.Period;

public class Contact {
	private String service;
	private Date startDate;
	private Date endDate;
	private int stroke = -1;
	private int emergencyLevel = -1;
	private String extInfo;
	private String unit;
	private String location;
	private String firstDate = "07.03.2010";

	public Contact(String line, int type) throws Exception {
		convertLine(line, type);
	}

	public String getService() {
		return service;
	}

	public void setService(String service) {
		this.service = service;
	}

	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	public int getStroke() {
		return stroke;
	}

	public void setStroke(int stroke) {
		this.stroke = stroke;
	}

	public int getEmergencyLevel() {
		return emergencyLevel;
	}

	public void setEmergencyLevel(int emergencyLevel) {
		this.emergencyLevel = emergencyLevel;
	}

	public String getExtInfo() {
		return extInfo;
	}

	public void setExtInfo(String extInfo) {
		this.extInfo = extInfo;
	}

	public String getUnit() {
		return unit;
	}

	public void setUnit(String unit) {
		this.unit = unit;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	@Override
	public String toString() {
		return "Contact [service=" + service + ", startDate=" + startDate
				+ ", endDate=" + endDate + ", stroke=" + stroke
				+ ", emergencyLevel=" + emergencyLevel + ", extInfo=" + extInfo
				+ ", unit=" + unit + ", location=" + location + "]";
	}

	/**
	 * Converts a line from a cvs file to a Contact.
	 * 
	 * @param line
	 *            Text string with a list of parameters divided by semicolons.
	 * @param type
	 *            Type of contact. 0=HELFO, 1=St. Olavs Hospital, 2=PLO.
	 */
	public void convertLine(String line, int type) throws Exception {
		SimpleDateFormat format = null;
		String[] split = line.split(";");
		try {
			if (type == 0) {
				// HELFO - PID, Service, Start, End, Stroke Diagnose
				format = new SimpleDateFormat("dd.MM.yyyy");
				service = split[1];
				try {
					startDate = format.parse(split[2]);
					endDate = startDate;
				} catch (ParseException e) {
					System.err.println("HELFO, parsing date: " + e);
				}
				stroke = Integer.parseInt(split[4]);
			} else if (type == 1) {
				// St. Olavs Hospital - PID, Service, Start, End, Stroke
				// Diagnose, Age Group, Emergency Level, Extended Information,
				// Unit, Location
				format = new SimpleDateFormat("dd.MM.yyyy H:m");
				if (split[1].equalsIgnoreCase("")) {
					service = split[8];
				} else {
					service = split[1];
				}
				try {
					startDate = format.parse(split[2]);
				} catch (ParseException e) {
					System.err.println("St. Olav, parsing start date: " + e);
				}
				try {
					endDate = format.parse(split[3]);
					long duration = endDate.getTime() - startDate.getTime();
					if (duration < 86400000) {
						endDate = startDate;
					}

				} catch (ParseException e) {
					System.err.println("St. Olav, parsing end date: " + e);
				}
				stroke = Integer.parseInt(split[4]);
				emergencyLevel = Integer.parseInt(split[6]);
				extInfo = split[7];
				unit = split[8];
				if (split.length > 9) {
					location = split[9];
				}
			} else if (type > 1) {
				// Municipality - PID, Service, Start, End
				format = new SimpleDateFormat("dd.MM.yyyy");
				service = split[1];
				if (!split[2].equals("") && !split[2].equalsIgnoreCase("null")) {
					startDate = format.parse(split[2]);
				} else {
					// If no start date: set the variable firstDate as start
					// date
					startDate = format.parse(firstDate);
				}
				if (split.length > 3) {
					if (!split[3].equals("")
							&& !split[3].equalsIgnoreCase("null")) {
						endDate = format.parse(split[3]);
					}
				} else {
					// If no end date: set start date as end date
					endDate = startDate;
				}
			} else {
				System.out.println(type + ": not acceppteable parameter, "
						+ line);
			}

			// System.out.println(this);

		} catch (ArrayIndexOutOfBoundsException e) {
			System.err.println(e);
			System.out.println(line);
		}
	}

	public static void main(String[] args) throws Exception {
		SimpleDateFormat df = new SimpleDateFormat("dd.MM.yyyy");
		DateTime oldDate = new DateTime(df.parse("01.01.2012"));
		DateTime newDate = oldDate.minusDays(Math.abs(666));
		System.out.println(newDate);
		Contact c = new Contact("", 0);
		try {
			c.convertLine(
					"42418671631;Hjertemedisin;14.01.2011 14:14;16.01.2011 12:54;0;8;1;HJERTEMEDISIN 4. ET. TUN 4-5;Sengepost;St.Olavs",
					1);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
