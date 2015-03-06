package data;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;

import data.Contact;

public class FileManager {

	private ArrayList<Contact> contacts = new ArrayList<Contact>();
	private final String folder = "E:/test/";
	private final String helfoFile = "finito_helfo.csv";
	private final String stolavFile = "finito_stolav.csv";
	private final String trdFile = "finito_trondheim.csv";
	private final String malvikFile = "finito_malvik.csv";
	private final String melhusFile = "finito_melhus.csv";
	private final String mgkFile = "finito_mgk.csv";
	static SimpleDateFormat format = new SimpleDateFormat("yyyy, MM, dd");
	private static Date date = new Date();

	public FileManager() throws Exception {
		readCsvFiles();
	}

	public static void main(String[] args) throws Exception {
		FileManager fm = new FileManager();
		fm.readCsvFiles();
		fm.writeStatistics();
		// fm.findStroke();
		// System.out.println(fm.getContacts().get(0));
		// fm.printContacts(40060942046L);

	}

	public ArrayList<Contact> getContacts() {
		return contacts;
	}

	public void setContacts(ArrayList<Contact> contacts) {
		this.contacts = contacts;
	}

	public String printContacts(Long pid) {
		ArrayList<Contact> c = findContacts(pid);
		String print = "data.addRows([\n";
		for (Contact contact : c) {
			if (contact.getStartDate() != null) {
				print += "[new Date(" + format.format(contact.getStartDate())
						+ "), ";
				if (contact.getEndDate() != null) {
					print += "new Date(" + format.format(contact.getEndDate())
							+ "), ";
				} else {
					print += ", ";
				}
			} else if (contact.getEndDate() != null) {
				print += "[new Date(" + format.format(contact.getEndDate())
						+ "), , ";
			} else {
				print += "[, , ";
			}
			print += ", '" + contact.getService() + "'],\n";
		}
		print += "]);";
		// System.out.println(print);
		return print;
	}

	public ArrayList<Contact> findContacts(Long pid) {
		ArrayList<Contact> c = new ArrayList<Contact>();
		for (Contact contact : contacts) {
			try {
				if (contact.getPid().equals(pid)) {
					c.add(contact);
//					 System.out.println(contact);
				}
			} catch (Exception e) {
				System.err.println(e + ": " + contact);
			}
		}
		return c;
	}

	public ArrayList<Contact> findStroke() throws ParseException {
		HashSet<Long> pids = new HashSet<Long>();
		HashSet<Long> allPids = new HashSet<Long>();
		ArrayList<Contact> validContacts = new ArrayList<Contact>();
		date = format.parse("30.06.2010");
		for (Contact c : contacts) {
			allPids.add(c.getPid());
			if (c.getStartDate() != null) {
				if (c.getStartDate().before(date) && c.getStroke() == 1) {
					pids.add(c.getPid());
				}
			}
		}
		System.out.println("All pids: " + allPids.size());
		for (Long l : pids) {
			allPids.remove(l);
		}
		System.out.println("Unvalid pids: " + pids.size());
		System.out.println("Valid pids: " + allPids.size());
		for (Long l : allPids) {
			validContacts.addAll(findContacts(l));
		}
		ArrayList<Contact> c = findContacts(42500662255L);
		for (Contact contact : c) {
			System.out.println(contact);
		}
		System.out.println(c.size());

		return validContacts;
	}

	public void readCsvFiles() throws Exception {
		String[] paths = { folder + helfoFile, folder + stolavFile,
				folder + trdFile, folder + malvikFile, folder + melhusFile,
				folder + mgkFile };

		BufferedReader br = null;
		for (int i = 0; i < paths.length; i++) {
			br = new BufferedReader(new InputStreamReader(new FileInputStream(
					new File(paths[i]))));
			String line = br.readLine();
			while ((line = br.readLine()) != null) {
				Contact con = new Contact(line, i);
				// System.out.println(con);
				contacts.add(con);
			}
		}
	}

	public void writeStatistics() {
		HashSet<Long> uniquePids = new HashSet<Long>();
		HashSet<String> uniquePlaces = new HashSet<String>();
		int totDiagnoses = 0;
		for (Contact c : contacts) {
			uniquePids.add(c.getPid());
			uniquePlaces.add(c.getService());
			try {
				if (c.getStroke() == 1)
					totDiagnoses++;
			} catch (Exception e) {
				System.out.println(c);
				System.err.println(e);
			}
		}

		// Statistics
		System.out.println("Number of contacts: " + contacts.size());
		System.out.println("Number of unique patients: " + uniquePids.size());
		System.out.println("Number of stroke diagnoses: " + totDiagnoses);
		System.out.println("Number of unique places: " + uniquePlaces.size());

	}
}
